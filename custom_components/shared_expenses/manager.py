"""Shared Expenses manager."""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import replace
from datetime import UTC, date, datetime
from typing import Any

import aiohttp
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.dispatcher import async_dispatcher_send

from .clients.frankfurter import fetch_rate
from .const import EVENT_CHANGED, SIGNAL_GROUP_CHANGED
from .exceptions import (
    AdminNeedsAccountError,
    CannotRemoveAdminError,
    CategoryNotFoundError,
    CurrencyLockedError,
    ExchangeRateUnavailableError,
    ExpenseNotFoundError,
    GroupArchivedError,
    GroupNotFoundError,
    InvalidExpenseError,
    InvalidExpenseSharesError,
    InvalidPaymentError,
    InvalidSplitRuleError,
    MemberAlreadyInGroupError,
    MemberNotFoundError,
    NotAllowedError,
    PaymentNotFoundError,
    SharedExpensesError,
)
from .helpers import revisions
from .helpers.balances import GroupBalances, compute_balances, simplify_settlements
from .helpers.currency import RATE_ONE, apportion, convert, validate_rate
from .helpers.ids import new_id
from .helpers.splits import resolve_shares
from .helpers.statistics import GroupStatistics, compute_statistics
from .models import (
    Category,
    ExchangeRate,
    Expense,
    ExpenseShare,
    FieldChange,
    Group,
    GroupMember,
    GroupRole,
    Member,
    Payment,
    PaymentKind,
    Permission,
    RateSource,
    Revision,
    RevisionAction,
    RevisionEntity,
    SplitRule,
)
from .storage.database import Database


class SharedExpensesManager:
    """Shared Expenses business manager.

    Single entry point of the integration: the WebSocket API talks to this
    class, never to the repositories.
    """

    def __init__(self, database: Database) -> None:
        """Initialize manager."""

        self._database = database

    @property
    def database(self) -> Database:
        """Return database."""

        return self._database

    #
    # ------------------------------------------------------------------
    # Groups
    # ------------------------------------------------------------------
    #

    async def create_group(
        self,
        *,
        group_name: str,
        admin_name: str,
        admin_user_id: str | None = None,
        currency: str = "EUR",
        description: str | None = None,
        icon: str | None = None,
        color: str | None = None,
        split_rule: SplitRule | None = None,
    ) -> Group:
        """Create a group, run by whoever made it.

        The admin is the member the account already has, when it has one. There
        is one member per Home Assistant account and the database enforces it,
        so minting a fresh one for every group left the second group anybody
        made impossible to create: the same person cannot be two people, and a
        member outlives the groups they pass through.

        `admin_name` therefore names a member being met for the first time. It
        never renames one: the name they go by is theirs, and a new group is no
        reason to overwrite it with whatever the account happens to be called.
        """

        now = datetime.now(UTC)

        group = Group(
            id=new_id(),
            name=group_name,
            description=description,
            currency=currency,
            icon=icon,
            color=color,
            archived=False,
            created_at=now,
            split_rule=split_rule,
        )

        # Whoever this account already is. A member without an account has
        # nothing to be found by, and is always somebody new.
        existing = (
            await self.get_member_for_user(admin_user_id) if admin_user_id else None
        )

        admin = existing or Member(
            id=new_id(),
            user_id=admin_user_id,
            name=admin_name,
            color=None,
            created_at=now,
        )

        group_member = GroupMember(
            id=new_id(),
            group_id=group.id,
            member_id=admin.id,
            role=GroupRole.ADMIN,
            joined_at=now,
            left_at=None,
            created_at=now,
        )

        async with self._database.transaction():
            await self._database.group_repository.create(group)

            if existing is None:
                await self._database.member_repository.create(admin)

            await self._database.group_member_repository.create(group_member)

        return group

    async def get_group(self, group_id: str) -> Group:
        """Return a group."""

        group = await self._database.group_repository.get(group_id)

        if group is None:
            raise GroupNotFoundError(group_id)

        return group

    async def list_groups(self) -> list[Group]:
        """Return all groups, whoever asks.

        Prefer `list_user_groups`: the panel must never show a group the
        connected account does not belong to.
        """

        return await self._database.group_repository.list_all()

    async def list_user_groups(self, user_id: str) -> list[Group]:
        """Return the groups a Home Assistant account is an active member of."""

        return await self._database.group_repository.list_by_user(user_id)

    async def is_group_member(self, group_id: str, user_id: str) -> bool:
        """Return whether an account is an active member of a group."""

        return await self._database.group_repository.is_member(group_id, user_id)

    async def ensure_group_member(self, group_id: str, user_id: str) -> None:
        """Refuse an account that is not an active member of the group.

        Raises `GroupNotFoundError` rather than a dedicated error on purpose: a
        user must not be able to tell an existing group they cannot see from one
        that does not exist.
        """

        if not await self.is_group_member(group_id, user_id):
            raise GroupNotFoundError(group_id)

    async def group_role(self, group_id: str, user_id: str) -> GroupRole | None:
        """Return the role an account holds in a group, or None if it holds none.

        None covers both "not a member" and "a member who left": neither is a
        standing anybody acts from.
        """

        member = await self.get_member_for_user(user_id)

        if member is None:
            return None

        memberships = await self._database.group_member_repository.list_by_group(
            group_id,
        )

        for membership in memberships:
            if membership.member_id == member.id and membership.left_at is None:
                return membership.role

        return None

    async def ensure_permission(
        self,
        group_id: str,
        user_id: str,
        permission: Permission,
    ) -> None:
        """Refuse a member the group does not let do this.

        Membership first, so somebody outside the group is told it does not
        exist rather than that they are not allowed — the two answers leak
        different things, and only the first one is nobody's business.

        The admin is above every permission. That is what the role is for, and
        what makes a per-group switch enough: the one dimension that is per
        person already exists.
        """

        await self.ensure_group_member(group_id, user_id)

        if await self.group_role(group_id, user_id) is GroupRole.ADMIN:
            return

        group = await self.get_group(group_id)

        if permission not in group.permissions:
            raise NotAllowedError(permission)

    async def ensure_may_edit_member(
        self,
        group_id: str,
        member_id: str,
        user_id: str,
    ) -> None:
        """Refuse a member renaming or removing somebody who is not them.

        Yourself, always: a name is your own, and being unable to leave is the
        very trap the admin is still in — deliberately, and only until they hand
        the group on. Anybody else is managing the members.

        The group asking comes first, before either. `group_id` is not
        decoration: it is the journal the change lands in, and the event the
        group hears. Sharing *a* group with somebody is what gets the caller
        this far; being in *this* one is what lets them write into it — and
        without this the self shortcut walked straight past the wall, into the
        history of a household the caller had left.

        Then the other half: the member has to be in that group too. Otherwise
        the two checks never meet — sharing *some* group with the target, and
        being allowed in *this* one — and any group of your own, whose admin you
        are, would answer for somebody it has never held.
        """

        await self.ensure_group_member(group_id, user_id)

        if await self._member_of(user_id) == member_id:
            return

        memberships = await self._database.group_member_repository.list_by_group(
            group_id,
        )

        if not any(
            membership.member_id == member_id and membership.left_at is None
            for membership in memberships
        ):
            raise MemberNotFoundError(member_id)

        await self.ensure_permission(group_id, user_id, Permission.MANAGE_MEMBERS)

    async def ensure_may_edit_expense(self, expense: Expense, user_id: str) -> None:
        """Refuse a member touching an expense that is not theirs to touch.

        Theirs if they entered it or they paid it. Either alone strands
        somebody: recording what a flatmate paid would cost you the right to fix
        your own typo, and counting only the typist would let somebody with no
        stake in the money own the line.
        """

        me = await self._member_of(user_id)

        if me is not None and me in (
            expense.created_by_member_id,
            expense.paid_by_member_id,
        ):
            return

        await self.ensure_permission(
            expense.group_id,
            user_id,
            Permission.EDIT_OTHERS,
        )

    async def ensure_may_edit_payment(self, payment: Payment, user_id: str) -> None:
        """Refuse a member touching a payment that is not theirs to touch.

        Theirs if they wrote it down, or if it is about them — either party. A
        debt you owe is as much yours to correct as the lender's.
        """

        me = await self._member_of(user_id)

        if me is not None and me in (
            payment.created_by_member_id,
            payment.from_member_id,
            payment.to_member_id,
        ):
            return

        await self.ensure_permission(
            payment.group_id,
            user_id,
            Permission.EDIT_OTHERS,
        )

    async def ensure_may_restore(
        self,
        group_id: str,
        entity_id: str,
        entity_type: RevisionEntity,
        user_id: str,
    ) -> None:
        """Refuse a member bringing back something that was never theirs.

        The same rule as editing it, asked of the deletion that froze it: there
        is no row left to ask. Somebody who could not have touched the expense
        cannot undelete it either — a restore is the largest edit there is.

        One method for both kinds. The keys of an expense and of a payment do
        not overlap, so asking for all of them and taking what is there says
        exactly the right thing without a branch.
        """

        state = await self._deleted_state(
            group_id,
            entity_id,
            entity_type,
            (
                ExpenseNotFoundError
                if entity_type is RevisionEntity.EXPENSE
                else PaymentNotFoundError
            ),
        )

        me = await self._member_of(user_id)

        theirs = {
            state.get("created_by_member_id"),
            state.get("paid_by_member_id"),
            state.get("from_member_id"),
            state.get("to_member_id"),
        }

        if me is not None and me in theirs:
            return

        await self.ensure_permission(group_id, user_id, Permission.EDIT_OTHERS)

    async def ensure_admin(self, group_id: str, user_id: str) -> None:
        """Refuse anybody but the admin.

        For the three things no switch will ever cover: deleting the group,
        saying what its members may do, and handing it on.
        """

        await self.ensure_group_member(group_id, user_id)

        if await self.group_role(group_id, user_id) is not GroupRole.ADMIN:
            raise NotAllowedError(GroupRole.ADMIN)

    async def transfer_admin(
        self,
        group_id: str,
        member_id: str,
        *,
        actor_user_id: str | None = None,
    ) -> None:
        """Hand a group to one of its members.

        Whoever gives it up becomes an ordinary member — a group has one admin,
        so there is nowhere else for them to land. They can then leave, which
        until they hand it on they cannot: being stuck in your own group is not
        a rule protecting anything, it is what the handing on is for.

        One admin at a time, and that is the whole of it: both writes go
        together or neither does, or a group ends up with two people who can
        delete it, or with none at all.
        """

        await self.get_group(group_id)

        memberships = await self._database.group_member_repository.list_by_group(
            group_id,
        )

        active = [
            membership for membership in memberships if membership.left_at is None
        ]

        heir = next(
            (
                membership
                for membership in active
                if membership.member_id == member_id
            ),
            None,
        )

        if heir is None:
            raise MemberNotFoundError(member_id)

        # Somebody who cannot log in cannot run the group: they would hold every
        # right nobody can exercise, and nobody could ever hand it on again.
        member = await self.get_member(member_id)

        if member.user_id is None:
            raise AdminNeedsAccountError(member_id)

        if heir.role is GroupRole.ADMIN:
            return

        current = next(
            (
                membership
                for membership in active
                if membership.role is GroupRole.ADMIN
            ),
            None,
        )

        async with self._database.transaction():
            if current is not None:
                await self._database.group_member_repository.update(
                    replace(current, role=GroupRole.MEMBER),
                )

                # Two people changed standing, so two lines. The one giving it
                # up is not a footnote to the one taking it: they lost every
                # right they had, and their own history should say when.
                await self._record_role(
                    group_id=group_id,
                    member_id=current.member_id,
                    before=GroupRole.ADMIN,
                    after=GroupRole.MEMBER,
                    actor_user_id=actor_user_id,
                )

            await self._database.group_member_repository.update(
                replace(heir, role=GroupRole.ADMIN),
            )

            await self._record_role(
                group_id=group_id,
                member_id=heir.member_id,
                before=heir.role,
                after=GroupRole.ADMIN,
                actor_user_id=actor_user_id,
            )

    async def _record_role(
        self,
        *,
        group_id: str,
        member_id: str,
        before: GroupRole,
        after: GroupRole,
        actor_user_id: str | None,
    ) -> None:
        """Account for somebody's standing changing. Inside the transaction."""

        member = await self.get_member(member_id)

        await self._record(
            group_id=group_id,
            entity_type=RevisionEntity.MEMBER,
            entity_id=member_id,
            label=member.name,
            action=RevisionAction.UPDATED,
            actor_user_id=actor_user_id,
            changes=(FieldChange(field="role", before=str(before), after=str(after)),),
        )

    async def update_group(
        self,
        group: Group,
        *,
        actor_user_id: str | None = None,
    ) -> None:
        """Update a group, and account for what moved."""

        before = await self.get_group(group.id)

        # The currency is the unit every stored figure is written in. Changing it
        # converts nothing, so once the group holds any of them the same integers
        # would silently be read as another currency. The panel offers this only
        # on an empty group; this is the same rule, said where no panel can be
        # skipped — an automation or a direct command reaches here too.
        currency_changed = group.currency.upper() != before.currency.upper()
        if currency_changed and await self._holds_money(group.id):
            raise CurrencyLockedError(group.id)

        if group.default_category_id is not None:
            # Its own category, never another group's: the id comes from the
            # caller, and a foreign key alone would take any category in the
            # house.
            await self._get_group_category(group.id, group.default_category_id)

        changes = revisions.diff(
            revisions.group_state(before),
            revisions.group_state(group),
        )

        async with self._database.transaction():
            await self._database.group_repository.update(group)

            # Nothing moved: nothing to say. A save that changed no field is not
            # an event, and a journal full of them is a journal nobody reads.
            if changes:
                await self._record(
                    group_id=group.id,
                    entity_type=RevisionEntity.GROUP,
                    entity_id=group.id,
                    label=group.name,
                    action=RevisionAction.UPDATED,
                    actor_user_id=actor_user_id,
                    changes=changes,
                )

    async def _holds_money(self, group_id: str) -> bool:
        """Return whether a group holds anything counted in its currency.

        An expense or a payment stored figures in the group's currency; a
        category, a member, a name never touched money. So those two are what
        freezes the currency, and nothing else does. Read only when the currency
        is actually being changed, which is rare and always deliberate.

        Deleted is not gone. The deletion froze the figures already converted,
        and `_restored_money` deliberately keeps them rather than working them
        out again — so a group emptied by deleting everything and then switched
        to another currency would read its own history back in the wrong one the
        day somebody pressed Restore. Nothing prunes a revision, so what could
        come back counts as held.
        """

        if await self._database.expense_repository.list_by_group(group_id):
            return True

        if await self._database.payment_repository.list_by_group(group_id):
            return True

        return await self._database.revision_repository.has_deletion(
            group_id,
            RevisionEntity.EXPENSE,
            RevisionEntity.PAYMENT,
        )

    async def archive_group(
        self,
        group_id: str,
        *,
        actor_user_id: str | None = None,
    ) -> None:
        """Archive a group."""

        group = await self.get_group(group_id)

        await self.update_group(
            replace(group, archived=True),
            actor_user_id=actor_user_id,
        )

    async def restore_group(
        self,
        group_id: str,
        *,
        actor_user_id: str | None = None,
    ) -> None:
        """Restore an archived group."""

        group = await self.get_group(group_id)

        await self.update_group(
            replace(group, archived=False),
            actor_user_id=actor_user_id,
        )

    async def delete_group(self, group_id: str) -> None:
        """Delete a group and everything it contains.

        Announces itself rather than going through `_record`, being the one write
        that journals nothing: the revisions cascade away with the group, so
        there is nobody left to tell in the history. The dashboard and the bus
        still have to hear it — a group with entities on it has just stopped
        existing, and an automation may have been watching for exactly that.

        It journals nothing, but it takes the transaction like every other write.
        A bare `DELETE` takes no lock, so on the one connection it lands inside
        whatever `BEGIN` another task has open — and goes away again with that
        task's `ROLLBACK`, after `after_commit` has already told the house the
        group was gone, because the transaction it fell into was not this one's.
        """

        await self.get_group(group_id)

        async with self._database.transaction():
            await self._database.group_repository.delete(group_id)

            self._announce(
                group_id=group_id,
                entity=RevisionEntity.GROUP,
                entity_id=group_id,
                action=RevisionAction.DELETED,
                label=None,
                actor_user_id=None,
            )

    #
    # ------------------------------------------------------------------
    # Members
    # ------------------------------------------------------------------
    #

    async def create_member(
        self,
        *,
        name: str,
        user_id: str | None = None,
        color: str | None = None,
    ) -> Member:
        """Create a member."""

        member = Member(
            id=new_id(),
            user_id=user_id,
            name=name,
            color=color,
            created_at=datetime.now(UTC),
        )

        await self._database.member_repository.create(member)

        return member

    async def get_member(self, member_id: str) -> Member:
        """Return a member."""

        member = await self._database.member_repository.get(member_id)

        if member is None:
            raise MemberNotFoundError(member_id)

        return member

    async def list_members(self) -> list[Member]:
        """Return all members."""

        return await self._database.member_repository.list_all()

    async def get_member_for_user(self, user_id: str) -> Member | None:
        """Return the member backing a Home Assistant account, if any."""

        return await self._database.member_repository.get_by_user_id(user_id)

    async def ensure_shares_group(self, member_id: str, user_id: str) -> None:
        """Refuse an account that shares no active group with the member."""

        shares = await self._database.member_repository.shares_group_with_user(
            member_id,
            user_id,
        )

        if not shares:
            raise MemberNotFoundError(member_id)

    async def link_user(self, *, user_id: str, name: str) -> Member:
        """Return the member of a Home Assistant account, creating it once.

        A Home Assistant account maps to exactly one member, so this is how the
        panel turns a picked account into someone a group can hold.
        """

        existing = await self.get_member_for_user(user_id)

        if existing is not None:
            return existing

        return await self.create_member(name=name, user_id=user_id)

    async def list_group_members(
        self,
        group_id: str,
        *,
        include_left: bool = False,
    ) -> list[Member]:
        """Return the members of a group."""

        await self.get_group(group_id)

        return await self._database.member_repository.list_by_group(
            group_id,
            include_left=include_left,
        )

    async def list_group_memberships(self, group_id: str) -> list[GroupMember]:
        """Return the memberships of a group, including past ones."""

        await self.get_group(group_id)

        return await self._database.group_member_repository.list_by_group(group_id)

    async def update_member(
        self,
        member: Member,
        *,
        group_id: str,
        actor_user_id: str | None = None,
    ) -> None:
        """Update a member, and account for what moved.

        `group_id` is the group asking. A member is global — one per Home
        Assistant account, across every group — so a rename is felt everywhere,
        and there is no one group it belongs to. The one whose journal shows it
        is the one where it was decided; the others were not party to it.
        """

        before = await self.get_member(member.id)

        changes = revisions.diff(
            revisions.member_state(before),
            revisions.member_state(member),
        )

        async with self._database.transaction():
            await self._database.member_repository.update(member)

            if changes:
                await self._record(
                    group_id=group_id,
                    entity_type=RevisionEntity.MEMBER,
                    entity_id=member.id,
                    label=member.name,
                    action=RevisionAction.UPDATED,
                    actor_user_id=actor_user_id,
                    changes=changes,
                )

    async def delete_member(self, member_id: str) -> None:
        """Delete a member."""

        await self.get_member(member_id)

        await self._database.member_repository.delete(member_id)

    async def add_member_to_group(
        self,
        *,
        group_id: str,
        member_id: str,
        actor_user_id: str | None = None,
    ) -> GroupMember:
        """Add an existing member to a group, as a member.

        There is no role to pass, and that is the point. A group has one admin
        and it is handed on, never handed out — see `transfer_admin`. A door
        here for setting a role on the way in would be a door for bringing in an
        account of your own as a second admin, and every permission on the group
        would be worth nothing.
        """

        await self._get_active_group(group_id)

        await self.get_member(member_id)

        memberships = await self._database.group_member_repository.list_by_group(
            group_id,
        )

        if any(m.member_id == member_id and m.left_at is None for m in memberships):
            raise MemberAlreadyInGroupError(member_id)

        now = datetime.now(UTC)

        group_member = GroupMember(
            id=new_id(),
            group_id=group_id,
            member_id=member_id,
            role=GroupRole.MEMBER,
            joined_at=now,
            left_at=None,
            created_at=now,
        )

        member = await self.get_member(member_id)

        async with self._database.transaction():
            await self._database.group_member_repository.create(group_member)

            await self._record(
                group_id=group_id,
                entity_type=RevisionEntity.MEMBER,
                entity_id=member_id,
                label=member.name,
                action=RevisionAction.CREATED,
                actor_user_id=actor_user_id,
                changes=revisions.creation(
                    revisions.member_state(member, GroupRole.MEMBER),
                ),
            )

        return group_member

    async def create_group_member(
        self,
        *,
        group_id: str,
        name: str,
        user_id: str | None = None,
        color: str | None = None,
        actor_user_id: str | None = None,
    ) -> Member:
        """Create a member and add it to a group, in one transaction.

        As a member, always, for the same reason `add_member_to_group` takes no
        role: the admin is handed on, never handed out.
        """

        await self._get_active_group(group_id)

        now = datetime.now(UTC)

        member = Member(
            id=new_id(),
            user_id=user_id,
            name=name,
            color=color,
            created_at=now,
        )

        group_member = GroupMember(
            id=new_id(),
            group_id=group_id,
            member_id=member.id,
            role=GroupRole.MEMBER,
            joined_at=now,
            left_at=None,
            created_at=now,
        )

        async with self._database.transaction():
            await self._database.member_repository.create(member)
            await self._database.group_member_repository.create(group_member)

            await self._record(
                group_id=group_id,
                entity_type=RevisionEntity.MEMBER,
                entity_id=member.id,
                label=member.name,
                action=RevisionAction.CREATED,
                actor_user_id=actor_user_id,
                changes=revisions.creation(
                    revisions.member_state(member, GroupRole.MEMBER),
                ),
            )

        return member

    async def remove_member_from_group(
        self,
        group_member: GroupMember,
        *,
        actor_user_id: str | None = None,
    ) -> None:
        """Mark a member as having left the group.

        The admin stays: access comes from membership, so letting them out would
        strand the group with nobody able to run it. Hand it on first — that is
        what handing on is for — or archive it.
        """

        if group_member.role is GroupRole.ADMIN:
            raise CannotRemoveAdminError(group_member.member_id)

        member = await self.get_member(group_member.member_id)

        async with self._database.transaction():
            await self._database.group_member_repository.update(
                replace(group_member, left_at=datetime.now(UTC)),
            )

            await self._record(
                group_id=group_member.group_id,
                entity_type=RevisionEntity.MEMBER,
                entity_id=member.id,
                label=member.name,
                action=RevisionAction.DELETED,
                actor_user_id=actor_user_id,
                changes=revisions.deletion(
                    revisions.member_state(member, group_member.role),
                ),
            )

    #
    # ------------------------------------------------------------------
    # Categories
    # ------------------------------------------------------------------
    #

    async def create_category(
        self,
        *,
        group_id: str,
        name: str,
        icon: str | None = None,
        color: str | None = None,
        split_rule: SplitRule | None = None,
        actor_user_id: str | None = None,
    ) -> Category:
        """Create a category."""

        await self._get_active_group(group_id)

        category = Category(
            id=new_id(),
            group_id=group_id,
            name=name,
            icon=icon,
            color=color,
            created_at=datetime.now(UTC),
            split_rule=split_rule,
        )

        async with self._database.transaction():
            await self._database.category_repository.create(category)

            await self._record(
                group_id=group_id,
                entity_type=RevisionEntity.CATEGORY,
                entity_id=category.id,
                label=category.name,
                action=RevisionAction.CREATED,
                actor_user_id=actor_user_id,
                changes=revisions.creation(revisions.category_state(category)),
            )

        return category

    async def get_category(self, category_id: str) -> Category:
        """Return a category."""

        category = await self._database.category_repository.get(category_id)

        if category is None:
            raise CategoryNotFoundError(category_id)

        return category

    async def list_categories(self, group_id: str) -> list[Category]:
        """Return all categories of a group."""

        await self.get_group(group_id)

        return await self._database.category_repository.list_by_group(group_id)

    async def update_category(
        self,
        category: Category,
        *,
        actor_user_id: str | None = None,
    ) -> None:
        """Update a category, and account for what moved."""

        before = await self.get_category(category.id)

        changes = revisions.diff(
            revisions.category_state(before),
            revisions.category_state(category),
        )

        async with self._database.transaction():
            await self._database.category_repository.update(category)

            if changes:
                await self._record(
                    group_id=category.group_id,
                    entity_type=RevisionEntity.CATEGORY,
                    entity_id=category.id,
                    label=category.name,
                    action=RevisionAction.UPDATED,
                    actor_user_id=actor_user_id,
                    changes=changes,
                )

    async def delete_category(
        self,
        category_id: str,
        *,
        actor_user_id: str | None = None,
    ) -> None:
        """Delete a category.

        No snapshot and no restore: an expense keeps its own rule, the category
        only ever handed one out, and the expenses that pointed at it are set to
        no category rather than going with it. There is nothing here that a
        restore would have to get exactly right.
        """

        category = await self.get_category(category_id)

        async with self._database.transaction():
            await self._database.category_repository.delete(category_id)

            await self._record(
                group_id=category.group_id,
                entity_type=RevisionEntity.CATEGORY,
                entity_id=category_id,
                label=category.name,
                action=RevisionAction.DELETED,
                actor_user_id=actor_user_id,
                changes=revisions.deletion(revisions.category_state(category)),
            )

    #
    # ------------------------------------------------------------------
    # Payments
    # ------------------------------------------------------------------
    #

    async def create_payment(
        self,
        *,
        group_id: str,
        from_member_id: str,
        to_member_id: str,
        amount: int,
        payment_date: datetime,
        currency: str | None = None,
        exchange_rate: int | None = None,
        description: str | None = None,
        kind: PaymentKind = PaymentKind.REIMBURSEMENT,
        expense_id: str | None = None,
        actor_user_id: str | None = None,
    ) -> Payment:
        """Create a payment.

        `from_member_id` is whoever is out of pocket, whichever kind this is: on
        a reimbursement they settled up, on a debt they lent. The balances treat
        the two identically, because they are the same movement of money.

        `currency` is what was handed over, the group's unless said otherwise.
        It converts on the way in, once, exactly as an expense does: 100 USD paid
        back does not clear 100 EUR owed.

        `expense_id` is what it was about, when it was about one thing.
        """

        group = await self._get_active_group(group_id)

        _validate_payment(
            amount=amount,
            from_member_id=from_member_id,
            to_member_id=to_member_id,
        )

        await self.get_member(from_member_id)
        await self.get_member(to_member_id)
        await self._ensure_parties(group_id, from_member_id, to_member_id)

        paid_in = (currency or group.currency).upper()

        converted, rate, rate_as_of = await self._convert(
            amount=amount,
            paid_in=paid_in,
            group=group,
            on=payment_date.date(),
            given_rate=exchange_rate,
        )

        payment = Payment(
            id=new_id(),
            group_id=group_id,
            description=description,
            from_member_id=from_member_id,
            to_member_id=to_member_id,
            amount=amount,
            currency=paid_in,
            payment_date=payment_date,
            created_at=datetime.now(UTC),
            kind=kind,
            converted_amount=converted,
            exchange_rate=rate,
            rate_as_of=rate_as_of,
            expense_id=await self._settled_expense(expense_id, group_id),
            created_by_member_id=await self._member_of(actor_user_id),
        )

        async with self._database.transaction():
            await self._database.payment_repository.create(payment)

            await self._record(
                group_id=group_id,
                entity_type=RevisionEntity.PAYMENT,
                entity_id=payment.id,
                label=None,
                action=RevisionAction.CREATED,
                actor_user_id=actor_user_id,
                changes=revisions.creation(revisions.payment_state(payment)),
            )

        return payment

    async def _settled_expense(
        self,
        expense_id: str | None,
        group_id: str,
    ) -> str | None:
        """Return the expense a payment names, refusing one it cannot name.

        One way it cannot: an expense of another project. An id is enough to ask
        with, and without this the answer would come back — the same door the
        refund side keeps shut, and the same reason.

        Nothing else is refused, and the restraint is deliberate. A payment is
        not a share of the expense it names: it can be more, because one handover
        settles a month of them, and it can be less, because somebody paid half
        of what they owed. It can even name a refund — "I am giving you your part
        of what Decathlon sent back" is a real sentence. The link says what the
        money was about, and what money is about is not the manager's to judge.

        Refused rather than quietly dropped, as the refund's is: a link that does
        not appear reads as a save that did not take, and somebody would only try
        again.
        """

        if expense_id is None:
            return None

        expense = await self.get_expense(expense_id)

        if expense.group_id != group_id:
            raise InvalidPaymentError(
                "An expense of another project cannot be settled here.",
                code="payment_expense_other_project",
            )

        return expense_id

    async def _ensure_parties(
        self,
        group_id: str,
        from_member_id: str,
        to_member_id: str,
    ) -> None:
        """Refuse a payment moving this project's money onto somebody outside it.

        A member exists across the whole house, so proving that the two parties
        are somebody proves nothing about *whose* somebody. An id is enough to
        send, and the balances count whatever id they meet: a payment between
        two people this project never held would credit and debit a stranger the
        panel cannot even name, and the group's own figures would stop adding up
        to nothing. The same door `_settled_expense` keeps shut, and the same
        reason.

        Those who left are parties still. What they owed did not leave with
        them, and settling up is exactly what a departure calls for.
        """

        outside = {from_member_id, to_member_id} - await self._roster(group_id)

        if outside:
            raise InvalidPaymentError(
                "A member of another project cannot be part of this payment.",
                code="payment_member_other_project",
            )

    async def get_payment(self, payment_id: str) -> Payment:
        """Return a payment."""

        payment = await self._database.payment_repository.get(payment_id)

        if payment is None:
            raise PaymentNotFoundError(payment_id)

        return payment

    async def list_payments(self, group_id: str) -> list[Payment]:
        """Return all payments of a group."""

        await self.get_group(group_id)

        return await self._database.payment_repository.list_by_group(group_id)

    async def update_payment(
        self,
        payment: Payment,
        *,
        exchange_rate: int | None = None,
        actor_user_id: str | None = None,
    ) -> None:
        """Update a payment."""

        before = await self.get_payment(payment.id)
        group = await self.get_group(payment.group_id)

        _validate_payment(
            amount=payment.amount,
            from_member_id=payment.from_member_id,
            to_member_id=payment.to_member_id,
        )

        await self._ensure_parties(
            payment.group_id,
            payment.from_member_id,
            payment.to_member_id,
        )

        paid_in = payment.currency.upper()

        converted, rate, rate_as_of = await self._convert(
            amount=payment.amount,
            paid_in=paid_in,
            group=group,
            on=payment.payment_date.date(),
            given_rate=exchange_rate,
            known=before,
        )

        # Checked here as well as on the way in. An update carries the whole
        # payment, so a link this group has no business holding would otherwise
        # arrive by the back door. A link that is only waiting for its expense to
        # come back is left alone — see `_link_waits`.
        expense_id = payment.expense_id

        if not await self._link_waits(expense_id, before.expense_id):
            expense_id = await self._settled_expense(expense_id, payment.group_id)

        payment = replace(
            payment,
            currency=paid_in,
            converted_amount=converted,
            exchange_rate=rate,
            rate_as_of=rate_as_of,
            expense_id=expense_id,
        )

        changes = revisions.diff(
            revisions.payment_state(before),
            revisions.payment_state(payment),
        )

        async with self._database.transaction():
            await self._database.payment_repository.update(payment)

            # Saving with nothing changed is not something that happened.
            # Recording it would bury the real changes under noise. The write
            # itself still goes ahead: the state compared here is what the
            # history reads, and the row holds fields it does not — the rate
            # among them, which a save is entitled to correct.
            if changes:
                await self._record(
                    group_id=payment.group_id,
                    entity_type=RevisionEntity.PAYMENT,
                    entity_id=payment.id,
                    label=None,
                    action=RevisionAction.UPDATED,
                    actor_user_id=actor_user_id,
                    changes=changes,
                )

    async def delete_payment(
        self,
        payment_id: str,
        *,
        actor_user_id: str | None = None,
    ) -> None:
        """Delete a payment.

        A snapshot, as on an expense, and for the same reason: this revision is
        the last place it exists, and a restore is built from it.
        """

        payment = await self.get_payment(payment_id)

        async with self._database.transaction():
            await self._database.payment_repository.delete(payment_id)

            await self._record(
                group_id=payment.group_id,
                entity_type=RevisionEntity.PAYMENT,
                entity_id=payment_id,
                label=None,
                action=RevisionAction.DELETED,
                actor_user_id=actor_user_id,
                changes=revisions.deletion(revisions.payment_snapshot(payment)),
            )

    #
    # ------------------------------------------------------------------
    # Expenses
    # ------------------------------------------------------------------
    #

    async def create_expense(
        self,
        *,
        group_id: str,
        title: str,
        amount: int,
        paid_by_member_id: str,
        expense_date: datetime,
        currency: str | None = None,
        category_id: str | None = None,
        description: str | None = None,
        shares: Sequence[ExpenseShare] | None = None,
        split_rule: SplitRule | None = None,
        exchange_rate: int | None = None,
        refund_of: str | None = None,
        actor_user_id: str | None = None,
    ) -> Expense:
        """Create an expense and its shares.

        Pass `shares` to set every share explicitly. Otherwise the shares are
        derived from `split_rule`, falling back to the rule of the category,
        then to the rule of the group, then to an equal split.

        A negative amount is a refund from a shop: the same expense with the
        money going the other way. Whoever is down as having paid it is whoever
        got it back, and each share comes off what that member bore.

        `refund_of` names the purchase a refund gives money back on, and naming
        none is allowed: a shop handing money back is often about a basket rather
        than one line of it. It changes no figure — the shares are the money — so
        it is the one field here a mistake in cannot cost anybody anything.
        """

        group = await self._get_active_group(group_id)

        if amount == 0:
            raise InvalidExpenseError(
                "An expense amount cannot be zero.",
                code="expense_amount_zero",
            )

        await self.get_member(paid_by_member_id)

        category = await self._get_group_category(group_id, category_id)

        paid_in = (currency or group.currency).upper()

        converted, rate, rate_as_of = await self._convert(
            amount=amount,
            paid_in=paid_in,
            group=group,
            on=expense_date.date(),
            given_rate=exchange_rate,
        )

        amounts, effective_rule = await self._resolve_amounts(
            group=group,
            category=category,
            amount=amount,
            converted=converted,
            payer_id=paid_by_member_id,
            shares=shares,
            split_rule=split_rule,
        )

        now = datetime.now(UTC)

        expense = Expense(
            id=new_id(),
            group_id=group_id,
            category_id=category_id,
            title=title,
            description=description,
            amount=amount,
            currency=paid_in,
            paid_by_member_id=paid_by_member_id,
            expense_date=expense_date,
            created_at=now,
            split_rule=effective_rule,
            converted_amount=converted,
            exchange_rate=rate,
            rate_as_of=rate_as_of,
            created_by_member_id=await self._member_of(actor_user_id),
            refund_of=await self._refunded_expense(refund_of, group_id, converted),
        )

        built = _build_shares(expense.id, amounts, now)

        async with self._database.transaction():
            await self._database.expense_repository.create(expense, built)

            await self._record(
                group_id=group_id,
                entity_type=RevisionEntity.EXPENSE,
                entity_id=expense.id,
                label=expense.title,
                action=RevisionAction.CREATED,
                actor_user_id=actor_user_id,
                changes=revisions.creation(revisions.expense_state(expense, built)),
            )

        return expense

    async def _refunded_expense(
        self,
        refund_of: str | None,
        group_id: str,
        converted: int,
        *,
        waiting: bool = False,
    ) -> str | None:
        """Return the purchase a refund names, refusing one it cannot name.

        Four ways it cannot. A purchase is not a refund of anything, so only a
        negative amount may carry this at all — otherwise an ordinary expense
        could be filed as giving money back on another and read as both. A
        purchase from another project is out of reach: an id is enough to ask, and
        without this the answer would come back. A refund of a refund says nothing
        anybody means. And **a shop cannot hand back more than it was given**.

        That last one is not tidiness. The panel opens a refund on the way its
        purchase was borne, so a figure larger than the purchase stretches those
        proportions past anything they meant: 6,95 shared 3,48/3,47 — a single
        cent of rounding — becomes 7,51/7,49 when pulled out to 15,00, and the
        rounding reads as an intention nobody had.

        Compared in the group's own money, both sides, since a refund need not be
        in the currency the purchase was paid in.

        Refused rather than quietly dropped: a link that does not appear is read
        as a save that did not take, and somebody would only try again.

        `waiting` says the purchase is away and its link is being held rather
        than cut — see `_link_waits`. It drops only the three refusals the
        purchase itself answers, there being nothing left to ask them of. The
        first is not one of them: whether this is a refund at all is answered by
        the expense being saved, and an ordinary expense filed as giving money
        back is refused whether or not the id it carries names anything today.
        """

        if refund_of is None:
            return None

        if converted >= 0:
            raise InvalidExpenseError(
                "Only a refund can give money back on another expense.",
                code="refund_only",
            )

        if waiting:
            return refund_of

        purchase = await self.get_expense(refund_of)

        if purchase.group_id != group_id:
            raise InvalidExpenseError(
                "An expense of another project cannot be refunded here.",
                code="refund_other_project",
            )

        if purchase.amount < 0:
            raise InvalidExpenseError(
                "A refund cannot give money back on a refund.",
                code="refund_of_refund",
            )

        if -converted > purchase.converted_amount:
            raise InvalidExpenseError(
                "A refund cannot give back more than the expense it is refunding.",
                code="refund_exceeds_expense",
            )

        return refund_of

    async def get_expense(self, expense_id: str) -> Expense:
        """Return an expense."""

        expense = await self._database.expense_repository.get(expense_id)

        if expense is None:
            raise ExpenseNotFoundError(expense_id)

        return expense

    async def list_expenses(self, group_id: str) -> list[Expense]:
        """Return all expenses of a group."""

        await self.get_group(group_id)

        return await self._database.expense_repository.list_by_group(group_id)

    async def get_expense_shares(self, expense_id: str) -> list[ExpenseShare]:
        """Return the shares of an expense."""

        await self.get_expense(expense_id)

        return await self._database.expense_repository.get_shares(expense_id)

    async def list_expense_shares(self, group_id: str) -> list[ExpenseShare]:
        """Return the shares of every expense of a group."""

        await self.get_group(group_id)

        return await self._database.expense_repository.list_shares_by_group(group_id)

    async def update_expense(
        self,
        expense: Expense,
        shares: Sequence[ExpenseShare] | None = None,
        *,
        split_rule: SplitRule | None = None,
        exchange_rate: int | None = None,
        actor_user_id: str | None = None,
    ) -> None:
        """Update an expense and replace its shares."""

        previous = await self.get_expense(expense.id)

        # Read before anything is written: afterwards the old shares are gone,
        # and a history of what changed would have nothing to compare against.
        before = revisions.expense_state(
            previous,
            await self._database.expense_repository.get_shares(expense.id),
        )

        group = await self.get_group(expense.group_id)

        if expense.amount == 0:
            raise InvalidExpenseError(
                "An expense amount cannot be zero.",
                code="expense_amount_zero",
            )

        await self.get_member(expense.paid_by_member_id)

        category = await self._get_group_category(
            expense.group_id,
            expense.category_id,
        )

        paid_in = expense.currency.upper()

        converted, rate, rate_as_of = await self._convert(
            amount=expense.amount,
            paid_in=paid_in,
            group=group,
            on=expense.expense_date.date(),
            given_rate=exchange_rate,
            known=previous,
        )

        # After the conversion, not before: what a refund may not exceed is the
        # purchase in the group's own money, and until here this expense has only
        # the figure that was typed. A link waiting for its purchase to come back
        # drops only what the purchase itself would have answered — what this
        # expense answers on its own is asked either way.
        await self._refunded_expense(
            expense.refund_of,
            expense.group_id,
            converted,
            waiting=await self._link_waits(expense.refund_of, previous.refund_of),
        )

        amounts, effective_rule = await self._resolve_amounts(
            group=group,
            category=category,
            amount=expense.amount,
            converted=converted,
            payer_id=expense.paid_by_member_id,
            shares=shares,
            split_rule=split_rule,
        )

        updated = replace(
            expense,
            currency=paid_in,
            split_rule=effective_rule,
            converted_amount=converted,
            exchange_rate=rate,
            rate_as_of=rate_as_of,
        )
        built = _build_shares(expense.id, amounts, datetime.now(UTC))

        changes = revisions.diff(before, revisions.expense_state(updated, built))

        async with self._database.transaction():
            await self._database.expense_repository.update(updated, built)

            # Nothing moved: nothing to say. A save that changed no field is not
            # an event, and a journal full of them is a journal nobody reads.
            # The write itself still goes ahead: the state compared here is what
            # the history reads, and the row holds fields it does not — the split
            # rule among them, which resolves to the very same shares as often as
            # not and would otherwise be thrown away with the caller told it was
            # saved.
            if changes:
                await self._record(
                    group_id=expense.group_id,
                    entity_type=RevisionEntity.EXPENSE,
                    entity_id=expense.id,
                    label=updated.title,
                    action=RevisionAction.UPDATED,
                    actor_user_id=actor_user_id,
                    changes=changes,
                )

    async def delete_expense(
        self,
        expense_id: str,
        *,
        actor_user_id: str | None = None,
    ) -> None:
        """Delete an expense.

        A snapshot rather than the state the history reads: the row is about to
        be gone, this revision is the last place it exists, and it is what a
        restore is built from.
        """

        expense = await self.get_expense(expense_id)

        state = revisions.expense_snapshot(
            expense,
            await self._database.expense_repository.get_shares(expense_id),
        )

        async with self._database.transaction():
            await self._database.expense_repository.delete(expense_id)

            await self._record(
                group_id=expense.group_id,
                entity_type=RevisionEntity.EXPENSE,
                entity_id=expense_id,
                label=expense.title,
                action=RevisionAction.DELETED,
                actor_user_id=actor_user_id,
                changes=revisions.deletion(state),
            )

    async def restore_expense(
        self,
        group_id: str,
        expense_id: str,
        *,
        actor_user_id: str | None = None,
    ) -> Expense:
        """Bring a deleted expense back, with the id it always had.

        The same expense, not a copy of it: the id, the date, the payer, the
        shares and above all the rate it was frozen at. Its history therefore
        runs on unbroken — added, changed, deleted, restored, one line — and
        every link the journal holds to it works again.

        Built from the deletion revision, which is the only place it still
        exists. Anything the snapshot does not carry is reworked rather than
        guessed at; see `_restored_money`.
        """

        group = await self._get_active_group(group_id)

        # Already back. The state asked for is the state there is, so this is
        # not a failure — somebody else got there first, or a second press
        # landed. Nothing to record: nothing happened.
        existing = await self._database.expense_repository.get(expense_id)

        if existing is not None:
            return existing

        state = await self._deleted_state(
            group_id,
            expense_id,
            RevisionEntity.EXPENSE,
            ExpenseNotFoundError,
        )

        expense_date = datetime.fromisoformat(state["expense_date"])
        currency = state.get("currency") or group.currency

        converted, rate, rate_as_of = await self._restored_money(
            state=state,
            group=group,
            amount=state["amount"],
            currency=currency,
            on=expense_date.date(),
        )

        now = datetime.now(UTC)

        expense = Expense(
            id=expense_id,
            group_id=group_id,
            # The category may have gone while the expense was away, and unlike
            # the two links below this one is held by a foreign key: an expense
            # written back into a category that is no longer there is refused by
            # the database, and the restore fails on an error nobody can act on.
            # It comes back in no category, which is where the deletion would
            # have left it had it still been on the table.
            category_id=await self._restored_category(
                group_id,
                state.get("category_id"),
            ),
            title=state["title"],
            description=state.get("description"),
            amount=state["amount"],
            currency=currency,
            paid_by_member_id=state["paid_by_member_id"],
            expense_date=expense_date,
            # Now, because now is when this row was written. The expense keeps
            # its own date, which is the one anybody reads; this only breaks
            # ties between things entered on the same day.
            created_at=now,
            split_rule=revisions.rule_from_state(state),
            converted_amount=converted,
            exchange_rate=rate,
            rate_as_of=rate_as_of,
            created_by_member_id=state.get("created_by_member_id"),
            # Brought back naming the purchase it named. That purchase may itself
            # be away, in which case the link waits for it exactly as it did
            # before this refund was deleted.
            refund_of=state.get("refund_of"),
        )

        built = _build_shares(expense.id, state.get("shares") or {}, now)

        async with self._database.transaction():
            await self._database.expense_repository.create(expense, built)

            await self._record(
                group_id=group_id,
                entity_type=RevisionEntity.EXPENSE,
                entity_id=expense.id,
                label=expense.title,
                action=RevisionAction.RESTORED,
                actor_user_id=actor_user_id,
                changes=revisions.restored(revisions.expense_state(expense, built)),
            )

        return expense

    async def restore_payment(
        self,
        group_id: str,
        payment_id: str,
        *,
        actor_user_id: str | None = None,
    ) -> Payment:
        """Bring a deleted payment back, with the id it always had."""

        group = await self._get_active_group(group_id)

        existing = await self._database.payment_repository.get(payment_id)

        if existing is not None:
            return existing

        state = await self._deleted_state(
            group_id,
            payment_id,
            RevisionEntity.PAYMENT,
            PaymentNotFoundError,
        )

        payment_date = datetime.fromisoformat(state["payment_date"])
        currency = state.get("currency") or group.currency

        converted, rate, rate_as_of = await self._restored_money(
            state=state,
            group=group,
            amount=state["amount"],
            currency=currency,
            on=payment_date.date(),
        )

        payment = Payment(
            id=payment_id,
            group_id=group_id,
            description=state.get("description"),
            from_member_id=state["from_member_id"],
            to_member_id=state["to_member_id"],
            amount=state["amount"],
            currency=currency,
            payment_date=payment_date,
            created_at=datetime.now(UTC),
            kind=PaymentKind(state.get("kind") or PaymentKind.REIMBURSEMENT),
            converted_amount=converted,
            exchange_rate=rate,
            rate_as_of=rate_as_of,
            # Straight from the snapshot and not checked again: it was checked
            # when it was written, and what it names may well be away too — a
            # month's tidying up deletes an expense and the payment about it, and
            # bringing either back must not depend on the order.
            expense_id=state.get("expense_id"),
            created_by_member_id=state.get("created_by_member_id"),
        )

        async with self._database.transaction():
            await self._database.payment_repository.create(payment)

            await self._record(
                group_id=group_id,
                entity_type=RevisionEntity.PAYMENT,
                entity_id=payment.id,
                label=None,
                action=RevisionAction.RESTORED,
                actor_user_id=actor_user_id,
                changes=revisions.restored(revisions.payment_state(payment)),
            )

        return payment

    async def _deleted_state(
        self,
        group_id: str,
        entity_id: str,
        entity_type: RevisionEntity,
        missing: type[SharedExpensesError],
    ) -> dict[str, Any]:
        """Return what the latest deletion of this thing froze.

        The group is given rather than taken from the revision: the caller has
        been cleared for that group, and a revision of another one must not come
        back through this door.

        Nothing to restore reads as the thing not existing, which is the truth:
        it does not, and there is no record of it ever having.
        """

        found = await self._database.revision_repository.list_by_entity(entity_id)

        # Newest first, so the first deletion found is the one that put it away.
        deletion = next(
            (
                revision
                for revision in found
                if revision.group_id == group_id
                and revision.entity_type is entity_type
                and revision.action is RevisionAction.DELETED
            ),
            None,
        )

        if deletion is None:
            raise missing(entity_id)

        return revisions.from_changes(deletion.changes)

    async def _restored_money(
        self,
        *,
        state: dict[str, Any],
        group: Group,
        amount: int,
        currency: str,
        on: date,
    ) -> tuple[int, int, date | None]:
        """Return what a restored thing is worth to the group, and at what rate.

        Kept, never recomputed, when the snapshot carries it. What somebody owed
        was settled on the day they owed it, and converting afresh at today's
        rate would restore a different debt from the one that was deleted.

        Older deletions have no snapshot — they were written before there was
        one — so the money is worked out again, for the thing's *own* day. The
        rate of a day gone by does not move, so this lands on the very rate it
        was frozen at, and on a group's own currency it is one either way.
        """

        converted = state.get("converted_amount")
        rate = state.get("exchange_rate")

        if converted is not None and rate is not None:
            stored = state.get("rate_as_of")
            as_of = None if stored is None else date.fromisoformat(stored)

            return converted, rate, as_of

        return await self._convert(
            amount=amount,
            paid_in=currency,
            group=group,
            on=on,
            given_rate=None,
        )

    async def _restored_category(
        self,
        group_id: str,
        category_id: str | None,
    ) -> str | None:
        """Return the category a restored expense goes back into, if it is there.

        Every other link a restore carries is held loosely and may point at
        nothing; this one is a foreign key, and a row written back against a
        category that has since been deleted is refused outright. Deleting a
        category sets the expenses on it to none, and this is the same answer for
        the one that was not there to be set.
        """

        if category_id is None:
            return None

        try:
            await self._get_group_category(group_id, category_id)
        except CategoryNotFoundError:
            return None

        return category_id

    #
    # ------------------------------------------------------------------
    # Exchange rates
    # ------------------------------------------------------------------
    #

    async def get_exchange_rate(
        self,
        *,
        base: str,
        quote: str,
        on: date,
    ) -> ExchangeRate:
        """Return the rate for a pair on a day, fetching it if need be.

        In order: what is already known for that day, then the source, then the
        most recent thing known for that pair — whatever its age. The caller is
        told which it got, and how old, so it can say so rather than pass a
        month-old rate off as today's.

        Raises `ExchangeRateUnavailableError` only when all three come up empty,
        which is the one case where somebody has to type a rate in.
        """

        base = base.upper()
        quote = quote.upper()

        if base == quote:
            return ExchangeRate(
                id=new_id(),
                base=base,
                quote=quote,
                rate=RATE_ONE,
                as_of=on,
                source=RateSource.ECB,
                created_at=datetime.now(UTC),
            )

        known = await self._database.exchange_rate_repository.get(base, quote, on)

        if known is not None:
            return known

        try:
            rate, as_of = await fetch_rate(self._session(), base, quote, on)
        except ExchangeRateUnavailableError:
            # The source is out of reach. The last rate known is worth far more
            # than a refusal — as long as its date goes with it, which it does.
            latest = await self._database.exchange_rate_repository.latest(base, quote)

            if latest is None:
                raise

            return latest

        stored = ExchangeRate(
            id=new_id(),
            base=base,
            quote=quote,
            rate=validate_rate(rate),
            as_of=as_of,
            source=RateSource.ECB,
            created_at=datetime.now(UTC),
        )

        await self._database.exchange_rate_repository.upsert(stored)

        return stored

    async def set_exchange_rate(
        self,
        *,
        base: str,
        quote: str,
        on: date,
        rate: int,
    ) -> ExchangeRate:
        """Record a rate somebody typed, and hand it back.

        It becomes the last known one for that pair, so the next expense finds
        it even if the source is still down. A later fetch that succeeds for the
        same day replaces it: it was only ever standing in.
        """

        stored = ExchangeRate(
            id=new_id(),
            base=base.upper(),
            quote=quote.upper(),
            rate=validate_rate(rate),
            as_of=on,
            source=RateSource.MANUAL,
            created_at=datetime.now(UTC),
        )

        await self._database.exchange_rate_repository.upsert(stored)

        return stored

    def _session(self) -> aiohttp.ClientSession:
        """Home Assistant's own HTTP session.

        Never one of ours: it is pooled, closed with Home Assistant, and set up
        the way Home Assistant wants it.
        """

        return async_get_clientsession(self._database.hass)

    #
    # ------------------------------------------------------------------
    # Statistics
    # ------------------------------------------------------------------
    #

    async def get_statistics(
        self,
        group_id: str,
        year: int | None = None,
    ) -> GroupStatistics:
        """Return what a group spent, over one year or over everything."""

        await self.get_group(group_id)

        return compute_statistics(
            expenses=await self._database.expense_repository.list_by_group(group_id),
            shares=await self._database.expense_repository.list_shares_by_group(
                group_id
            ),
            year=year,
        )

    #
    # ------------------------------------------------------------------
    # Revisions
    # ------------------------------------------------------------------
    #

    async def list_revisions(self, group_id: str, limit: int = 200) -> list[Revision]:
        """Return what happened in a group, newest first."""

        await self.get_group(group_id)

        return await self._database.revision_repository.list_by_group(group_id, limit)

    async def list_entity_revisions(
        self,
        group_id: str,
        entity_id: str,
    ) -> list[Revision]:
        """Return the history of one expense or payment, newest first.

        Takes the group it belongs to rather than trusting the entity to name
        it: the caller has already been cleared for that group, and a revision
        of another one must not come back through this door.
        """

        await self.get_group(group_id)

        found = await self._database.revision_repository.list_by_entity(entity_id)

        return [revision for revision in found if revision.group_id == group_id]

    async def _record(
        self,
        *,
        group_id: str,
        entity_type: RevisionEntity,
        entity_id: str,
        label: str | None,
        action: RevisionAction,
        actor_user_id: str | None,
        changes: tuple[FieldChange, ...],
    ) -> None:
        """Append a revision, and say the group moved.

        Every write worth accounting for comes through here, so this is where
        the dashboard hears about it: one place rather than a `_notify` sprinkled
        down thirty methods, one of which would be forgotten. A change nobody
        journals is a change nobody needed to be told about either — the two
        questions have the same answer, which is why they share a door.

        Announced through `Database.after_commit`, so it is heard when the write
        is on disk and never when it is undone. It used to be sent from here,
        before the commit, on the reasoning that nobody read yet — true until
        Home Assistant began starting tasks eagerly. Sending it after the commit
        by hand would need every caller to remember to, which is the kind of
        remembering this method exists to take away, so the database remembers
        instead.
        """

        await self._database.revision_repository.create(
            Revision(
                id=new_id(),
                group_id=group_id,
                entity_type=entity_type,
                entity_id=entity_id,
                entity_label=label,
                action=action,
                actor_user_id=actor_user_id,
                changes=changes,
                at=datetime.now(UTC),
            )
        )

        # Journalled, then announced. The order stopped mattering the day the
        # announcement started waiting for the commit; it is kept because that
        # is the order the two things happen in.
        self._announce(
            group_id=group_id,
            entity=entity_type,
            entity_id=entity_id,
            action=action,
            label=label,
            actor_user_id=actor_user_id,
        )

    def _announce(
        self,
        *,
        group_id: str,
        entity: RevisionEntity,
        entity_id: str,
        action: RevisionAction,
        label: str | None,
        actor_user_id: str | None,
    ) -> None:
        """Tell the dashboard and the bus that a group moved — once it really has.

        Three listeners, one door. The coordinator hears the signal and redoes
        the arithmetic; a card left running on a kitchen wall hears the same one
        and asks for the figures again; anything else in the house hears the
        event and may act on it — a notification, a reminder, a light. The event
        carries what the journal carries, and no more: an automation that needs
        the figures reads them for itself, as anyone cleared for the group can.

        Handed to the database rather than sent from here. Every one of these
        sends somebody back to this connection, and a reader told before the
        COMMIT reads a write that has not landed — see `Database.after_commit`,
        which holds it until it has and throws it away when it never does.

        The event's name and shape are a promise to whoever wrote an automation
        against them; they change with the same care a stored column would.
        """

        hass = self._database.hass

        def _speak() -> None:
            """Say it, with the write behind it."""

            async_dispatcher_send(hass, SIGNAL_GROUP_CHANGED, group_id)

            hass.bus.async_fire(
                EVENT_CHANGED,
                {
                    "group_id": group_id,
                    "entity": str(entity),
                    "entity_id": entity_id,
                    "action": str(action),
                    "label": label,
                    "actor_user_id": actor_user_id,
                },
            )

        self._database.after_commit(_speak)

    #
    # ------------------------------------------------------------------
    # Balances
    # ------------------------------------------------------------------
    #

    async def get_balances(self, group_id: str) -> GroupBalances:
        """Return the balances of a group and how to clear them."""

        await self.get_group(group_id)

        # Members who left are included: they may still owe or be owed money.
        members = await self._database.member_repository.list_by_group(
            group_id,
            include_left=True,
        )

        balances = compute_balances(
            member_ids=[member.id for member in members],
            expenses=await self._database.expense_repository.list_by_group(group_id),
            shares=await self._database.expense_repository.list_shares_by_group(
                group_id,
            ),
            payments=await self._database.payment_repository.list_by_group(group_id),
        )

        return GroupBalances(
            balances=balances,
            settlements=simplify_settlements(balances),
        )

    #
    # ------------------------------------------------------------------
    # Internals
    # ------------------------------------------------------------------
    #

    async def _member_of(self, user_id: str | None) -> str | None:
        """Return the member id behind a Home Assistant account, if any.

        None for an account nobody is tied to, and for no account at all: a
        script, a test, a version that did not record who was acting.
        """

        if user_id is None:
            return None

        member = await self.get_member_for_user(user_id)

        return None if member is None else member.id

    async def _get_active_group(self, group_id: str) -> Group:
        """Return a group, refusing archived ones."""

        group = await self.get_group(group_id)

        if group.archived:
            raise GroupArchivedError(group_id)

        return group

    async def _get_group_category(
        self,
        group_id: str,
        category_id: str | None,
    ) -> Category | None:
        """Return a category, making sure it belongs to the group."""

        if category_id is None:
            return None

        category = await self.get_category(category_id)

        if category.group_id != group_id:
            raise CategoryNotFoundError(category_id)

        return category

    async def _roster(self, group_id: str) -> set[str]:
        """Return everybody the group has ever held, those who left included.

        Somebody who left is one of them still: what they owed did not leave
        with them, and an expense entered while they were here has to stay
        editable afterwards. This is what a project's money may be put on, which
        is a wider question than who may be split between today.
        """

        members = await self._database.member_repository.list_by_group(
            group_id,
            include_left=True,
        )

        return {member.id for member in members}

    async def _link_waits(self, link: str | None, before: str | None) -> bool:
        """Return whether an unchanged link names an expense that is away.

        A deleted expense really leaves its table and comes back under the same
        id, so what named it goes on naming it: the columns hold no foreign key
        on purpose, both restores bring the link back unexamined, and the panel
        shows it as waiting rather than as wrong. There is nothing left to ask
        about such a link, so it is held exactly as it stands.

        As it stands, and only that. A link being set or changed has never been
        through the door and goes through it now — the checks it faces are the
        reason the door is there.
        """

        if link is None or link != before:
            return False

        return await self._database.expense_repository.get(link) is None

    async def _convert(
        self,
        *,
        amount: int,
        paid_in: str,
        group: Group,
        on: date,
        given_rate: int | None,
        known: Expense | Payment | None = None,
    ) -> tuple[int, int, date | None]:
        """Return the amount in the group's currency, the rate, and its day.

        The rate comes from whoever knows best, in order: the caller, who has
        just shown it on screen and had it accepted; the record as it already
        stood, so re-saving one does not silently re-price it at today's rate;
        then the source.

        An expense and a payment are the same problem here — an amount, in a
        currency, on a day — so `known` is either.
        """

        if paid_in == group.currency.upper():
            return amount, RATE_ONE, None

        if given_rate is not None:
            rate = validate_rate(given_rate)

            return convert(amount, rate), rate, on

        # Editing an expense that already converted: keep its rate. What
        # someone owes was settled on the day they were owed it.
        if (
            known is not None
            and known.currency.upper() == paid_in
            and known.rate_as_of is not None
        ):
            return (
                convert(amount, known.exchange_rate),
                known.exchange_rate,
                known.rate_as_of,
            )

        found = await self.get_exchange_rate(
            base=paid_in,
            quote=group.currency,
            on=on,
        )

        return convert(amount, found.rate), found.rate, found.as_of

    async def _resolve_amounts(
        self,
        *,
        group: Group,
        category: Category | None,
        amount: int,
        converted: int,
        payer_id: str,
        shares: Sequence[ExpenseShare] | None,
        split_rule: SplitRule | None,
    ) -> tuple[dict[str, int], SplitRule | None]:
        """Return what each member owes, and the rule to remember it by.

        The split is settled in `amount`, the currency the expense was paid in:
        that is the figure the panel puts the editor under, so "Antonin owes 20"
        on a New York dinner means twenty dollars, and a rule kept on the
        expense reads back against the amount it sits beside.

        What comes back is in the group's currency, because that is what the
        balances count and what the shares are stored as. The two are the same
        money and, in the usual case of a group spending its own currency, the
        same number.
        """

        rule = split_rule

        if rule is None and category is not None:
            rule = category.split_rule

        if rule is None:
            rule = group.split_rule

        members = await self._database.member_repository.list_by_group(group.id)
        member_ids = [member.id for member in members]

        if shares is not None:
            await self._ensure_of_group(group.id, payer_id, shares)

            amounts = _explicit_amounts(shares, amount)
        else:
            amounts = resolve_shares(
                amount=amount,
                payer_id=payer_id,
                member_ids=member_ids,
                rule=rule,
            )

        if converted != amount:
            amounts = apportion(amounts, converted)

        return amounts, _pin_members(rule, payer_id, member_ids)

    async def _ensure_of_group(
        self,
        group_id: str,
        payer_id: str,
        shares: Sequence[ExpenseShare],
    ) -> None:
        """Refuse explicit shares put on people this project never held.

        The rule path is held to the group's own members by `resolve_shares`,
        which refuses a payer outside the pool and a participant it does not
        know. Shares that arrive already worked out went round that check
        entirely: an id is enough to send, and the balances count whatever id
        they meet, so a project's money could be split onto somebody its own
        panel cannot name.

        The roster rather than the pool above, because a member who left may
        still owe: the pool is who a rule may split between today, and this is
        who the money may be put on at all. Held to the same two reasons, so a
        refusal reads the same whichever path found it.
        """

        roster = await self._roster(group_id)

        if payer_id not in roster:
            raise InvalidSplitRuleError(
                "The payer must be a member of the group.",
                code="split_payer_not_member",
            )

        unknown = sorted({share.member_id for share in shares} - roster)

        if unknown:
            raise InvalidSplitRuleError(
                f"Unknown share member: {', '.join(unknown)}",
                code="split_unknown_member",
            )


def _pin_members(
    rule: SplitRule | None,
    payer_id: str,
    member_ids: list[str],
) -> SplitRule | None:
    """Spell out the members a rule applies to, before storing it.

    A rule saying "everyone" would pull in whoever joins later, and re-resolving
    it would no longer give back the stored shares. Naming the members freezes
    the expense to the people who were actually part of it.
    """

    if rule is None:
        return None

    return replace(
        rule,
        participants=(
            tuple(member_ids) if rule.participants is None else rule.participants
        ),
        remainder=replace(
            rule.remainder,
            members=(
                (payer_id,)
                if rule.remainder.members is None
                else rule.remainder.members
            ),
        ),
    )


def _validate_payment(
    *,
    amount: int,
    from_member_id: str,
    to_member_id: str,
) -> None:
    """Check the invariants of a payment."""

    if amount <= 0:
        raise InvalidPaymentError(
            "A payment amount must be positive.",
            code="payment_amount_positive",
        )

    if from_member_id == to_member_id:
        raise InvalidPaymentError(
            "A member cannot pay themselves.",
            code="payment_to_self",
        )


def _explicit_amounts(shares: Sequence[ExpenseShare], amount: int) -> dict[str, int]:
    """Return the amounts of explicitly provided shares.

    Every share runs the same way as the expense: a purchase is borne, a refund
    is given back. One share pulling against the others would say a member owes
    money because a shop handed some back, which no split means to say.
    """

    amounts: dict[str, int] = {}

    for share in shares:
        amounts[share.member_id] = amounts.get(share.member_id, 0) + share.amount

    if not amounts:
        raise InvalidExpenseSharesError(
            "An expense needs at least one share.",
            code="shares_none",
        )

    if amount > 0 and any(value < 0 for value in amounts.values()):
        raise InvalidExpenseSharesError(
            "A share cannot be negative.",
            code="share_negative",
        )

    if amount < 0 and any(value > 0 for value in amounts.values()):
        raise InvalidExpenseSharesError(
            "A share of a refund cannot be positive.",
            code="refund_share_positive",
        )

    if sum(amounts.values()) != amount:
        raise InvalidExpenseSharesError(
            "Shares do not add up to the expense amount.",
            code="shares_do_not_add_up",
        )

    return {member_id: value for member_id, value in amounts.items() if value != 0}


def _build_shares(
    expense_id: str,
    amounts: dict[str, int],
    created_at: datetime,
) -> list[ExpenseShare]:
    """Build the shares of an expense from resolved amounts."""

    return [
        ExpenseShare(
            id=new_id(),
            expense_id=expense_id,
            member_id=member_id,
            amount=amount,
            created_at=created_at,
        )
        for member_id, amount in amounts.items()
    ]
