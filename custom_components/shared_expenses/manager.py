"""Shared Expenses manager."""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import replace
from datetime import UTC, date, datetime

import aiohttp
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .clients.frankfurter import fetch_rate
from .exceptions import (
    AdminNeedsAccountError,
    CannotRemoveAdminError,
    CategoryNotFoundError,
    ExchangeRateUnavailableError,
    ExpenseNotFoundError,
    GroupArchivedError,
    GroupNotFoundError,
    InvalidExpenseError,
    InvalidExpenseSharesError,
    InvalidPaymentError,
    MemberAlreadyInGroupError,
    MemberNotFoundError,
    NotAllowedError,
    PaymentNotFoundError,
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
        """

        if await self._member_of(user_id) == member_id:
            return

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

    async def ensure_admin(self, group_id: str, user_id: str) -> None:
        """Refuse anybody but the admin.

        For the three things no switch will ever cover: deleting the group,
        saying what its members may do, and handing it on.
        """

        await self.ensure_group_member(group_id, user_id)

        if await self.group_role(group_id, user_id) is not GroupRole.ADMIN:
            raise NotAllowedError(GroupRole.ADMIN)

    async def transfer_admin(self, group_id: str, member_id: str) -> None:
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

            await self._database.group_member_repository.update(
                replace(heir, role=GroupRole.ADMIN),
            )

    async def update_group(self, group: Group) -> None:
        """Update a group."""

        await self.get_group(group.id)

        if group.default_category_id is not None:
            # Its own category, never another group's: the id comes from the
            # caller, and a foreign key alone would take any category in the
            # house.
            await self._get_group_category(group.id, group.default_category_id)

        await self._database.group_repository.update(group)

    async def archive_group(self, group_id: str) -> None:
        """Archive a group."""

        group = await self.get_group(group_id)

        await self._database.group_repository.update(replace(group, archived=True))

    async def restore_group(self, group_id: str) -> None:
        """Restore an archived group."""

        group = await self.get_group(group_id)

        await self._database.group_repository.update(replace(group, archived=False))

    async def delete_group(self, group_id: str) -> None:
        """Delete a group and everything it contains."""

        await self.get_group(group_id)

        await self._database.group_repository.delete(group_id)

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

    async def update_member(self, member: Member) -> None:
        """Update a member."""

        await self.get_member(member.id)

        await self._database.member_repository.update(member)

    async def delete_member(self, member_id: str) -> None:
        """Delete a member."""

        await self.get_member(member_id)

        await self._database.member_repository.delete(member_id)

    async def add_member_to_group(
        self,
        *,
        group_id: str,
        member_id: str,
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

        await self._database.group_member_repository.create(group_member)

        return group_member

    async def create_group_member(
        self,
        *,
        group_id: str,
        name: str,
        user_id: str | None = None,
        color: str | None = None,
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

        return member

    async def remove_member_from_group(self, group_member: GroupMember) -> None:
        """Mark a member as having left the group.

        The admin stays: access comes from membership, so letting them out would
        strand the group with nobody able to run it. Hand it on first — that is
        what handing on is for — or archive it.
        """

        if group_member.role is GroupRole.ADMIN:
            raise CannotRemoveAdminError(group_member.member_id)

        await self._database.group_member_repository.update(
            replace(group_member, left_at=datetime.now(UTC)),
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

        await self._database.category_repository.create(category)

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

    async def update_category(self, category: Category) -> None:
        """Update a category."""

        await self.get_category(category.id)

        await self._database.category_repository.update(category)

    async def delete_category(self, category_id: str) -> None:
        """Delete a category."""

        await self.get_category(category_id)

        await self._database.category_repository.delete(category_id)

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
        actor_user_id: str | None = None,
    ) -> Payment:
        """Create a payment.

        `from_member_id` is whoever is out of pocket, whichever kind this is: on
        a reimbursement they settled up, on a debt they lent. The balances treat
        the two identically, because they are the same movement of money.

        `currency` is what was handed over, the group's unless said otherwise.
        It converts on the way in, once, exactly as an expense does: 100 USD paid
        back does not clear 100 EUR owed.
        """

        group = await self._get_active_group(group_id)

        _validate_payment(
            amount=amount,
            from_member_id=from_member_id,
            to_member_id=to_member_id,
        )

        await self.get_member(from_member_id)
        await self.get_member(to_member_id)

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

        paid_in = payment.currency.upper()

        converted, rate, rate_as_of = await self._convert(
            amount=payment.amount,
            paid_in=paid_in,
            group=group,
            on=payment.payment_date.date(),
            given_rate=exchange_rate,
            known=before,
        )

        payment = replace(
            payment,
            currency=paid_in,
            converted_amount=converted,
            exchange_rate=rate,
            rate_as_of=rate_as_of,
        )

        changes = revisions.diff(
            revisions.payment_state(before),
            revisions.payment_state(payment),
        )

        # Saving with nothing changed is not something that happened. Recording
        # it would bury the real changes under noise.
        if not changes:
            return

        async with self._database.transaction():
            await self._database.payment_repository.update(payment)

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
        """Delete a payment."""

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
                changes=revisions.deletion(revisions.payment_state(payment)),
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
        actor_user_id: str | None = None,
    ) -> Expense:
        """Create an expense and its shares.

        Pass `shares` to set every share explicitly. Otherwise the shares are
        derived from `split_rule`, falling back to the rule of the category,
        then to the rule of the group, then to an equal split.
        """

        group = await self._get_active_group(group_id)

        if amount <= 0:
            raise InvalidExpenseError("An expense amount must be positive.")

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

        if expense.amount <= 0:
            raise InvalidExpenseError("An expense amount must be positive.")

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

        if not changes:
            return

        async with self._database.transaction():
            await self._database.expense_repository.update(updated, built)

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
        """Delete an expense."""

        expense = await self.get_expense(expense_id)

        state = revisions.expense_state(
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
        """Append a revision. Call inside the transaction it accounts for."""

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
        raise InvalidPaymentError("A payment amount must be positive.")

    if from_member_id == to_member_id:
        raise InvalidPaymentError("A member cannot pay themselves.")


def _explicit_amounts(shares: Sequence[ExpenseShare], amount: int) -> dict[str, int]:
    """Return the amounts of explicitly provided shares."""

    amounts: dict[str, int] = {}

    for share in shares:
        amounts[share.member_id] = amounts.get(share.member_id, 0) + share.amount

    if not amounts:
        raise InvalidExpenseSharesError("An expense needs at least one share.")

    if any(value < 0 for value in amounts.values()):
        raise InvalidExpenseSharesError("A share cannot be negative.")

    if sum(amounts.values()) != amount:
        raise InvalidExpenseSharesError("Shares do not add up to the expense amount.")

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
