"""Shared Expenses manager."""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import replace
from datetime import UTC, datetime

from .exceptions import (
    CannotRemoveOwnerError,
    CategoryNotFoundError,
    ExpenseNotFoundError,
    GroupArchivedError,
    GroupNotFoundError,
    InvalidExpenseError,
    InvalidExpenseSharesError,
    InvalidPaymentError,
    MemberAlreadyInGroupError,
    MemberNotFoundError,
    PaymentNotFoundError,
)
from .helpers.balances import GroupBalances, compute_balances, simplify_settlements
from .helpers.ids import new_id
from .helpers.splits import resolve_shares
from .models import (
    Category,
    Expense,
    ExpenseShare,
    Group,
    GroupMember,
    GroupRole,
    Member,
    Payment,
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
        owner_name: str,
        owner_user_id: str | None = None,
        currency: str = "EUR",
        description: str | None = None,
        icon: str | None = None,
        color: str | None = None,
        split_rule: SplitRule | None = None,
    ) -> Group:
        """Create a group with its owner."""

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

        owner = Member(
            id=new_id(),
            user_id=owner_user_id,
            name=owner_name,
            color=None,
            created_at=now,
        )

        group_member = GroupMember(
            id=new_id(),
            group_id=group.id,
            member_id=owner.id,
            role=GroupRole.OWNER,
            joined_at=now,
            left_at=None,
            created_at=now,
        )

        async with self._database.transaction():
            await self._database.group_repository.create(group)
            await self._database.member_repository.create(owner)
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

    async def update_group(self, group: Group) -> None:
        """Update a group."""

        await self.get_group(group.id)

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
        role: GroupRole = GroupRole.MEMBER,
    ) -> GroupMember:
        """Add an existing member to a group."""

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
            role=role,
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
        role: GroupRole = GroupRole.MEMBER,
    ) -> Member:
        """Create a member and add it to a group, in one transaction."""

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
            role=role,
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

        The owner stays: access comes from membership, so letting them out would
        strand the group with nobody able to open it. Archive it instead.
        """

        if group_member.role is GroupRole.OWNER:
            raise CannotRemoveOwnerError(group_member.member_id)

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
        description: str | None = None,
    ) -> Payment:
        """Create a payment."""

        await self._get_active_group(group_id)

        _validate_payment(
            amount=amount,
            from_member_id=from_member_id,
            to_member_id=to_member_id,
        )

        await self.get_member(from_member_id)
        await self.get_member(to_member_id)

        payment = Payment(
            id=new_id(),
            group_id=group_id,
            description=description,
            from_member_id=from_member_id,
            to_member_id=to_member_id,
            amount=amount,
            payment_date=payment_date,
            created_at=datetime.now(UTC),
        )

        await self._database.payment_repository.create(payment)

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

    async def update_payment(self, payment: Payment) -> None:
        """Update a payment."""

        await self.get_payment(payment.id)

        _validate_payment(
            amount=payment.amount,
            from_member_id=payment.from_member_id,
            to_member_id=payment.to_member_id,
        )

        await self._database.payment_repository.update(payment)

    async def delete_payment(self, payment_id: str) -> None:
        """Delete a payment."""

        await self.get_payment(payment_id)

        await self._database.payment_repository.delete(payment_id)

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

        amounts = await self._resolve_amounts(
            group=group,
            category=category,
            amount=amount,
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
            currency=currency if currency is not None else group.currency,
            paid_by_member_id=paid_by_member_id,
            expense_date=expense_date,
            created_at=now,
        )

        async with self._database.transaction():
            await self._database.expense_repository.create(
                expense,
                _build_shares(expense.id, amounts, now),
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
    ) -> None:
        """Update an expense and replace its shares."""

        await self.get_expense(expense.id)

        group = await self.get_group(expense.group_id)

        if expense.amount <= 0:
            raise InvalidExpenseError("An expense amount must be positive.")

        await self.get_member(expense.paid_by_member_id)

        category = await self._get_group_category(
            expense.group_id,
            expense.category_id,
        )

        amounts = await self._resolve_amounts(
            group=group,
            category=category,
            amount=expense.amount,
            payer_id=expense.paid_by_member_id,
            shares=shares,
            split_rule=split_rule,
        )

        async with self._database.transaction():
            await self._database.expense_repository.update(
                expense,
                _build_shares(expense.id, amounts, datetime.now(UTC)),
            )

    async def delete_expense(self, expense_id: str) -> None:
        """Delete an expense."""

        await self.get_expense(expense_id)

        await self._database.expense_repository.delete(expense_id)

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

    async def _resolve_amounts(
        self,
        *,
        group: Group,
        category: Category | None,
        amount: int,
        payer_id: str,
        shares: Sequence[ExpenseShare] | None,
        split_rule: SplitRule | None,
    ) -> dict[str, int]:
        """Return the amount owed by each member, in cents."""

        if shares is not None:
            return _explicit_amounts(shares, amount)

        rule = split_rule

        if rule is None and category is not None:
            rule = category.split_rule

        if rule is None:
            rule = group.split_rule

        members = await self._database.member_repository.list_by_group(group.id)

        return resolve_shares(
            amount=amount,
            payer_id=payer_id,
            member_ids=[member.id for member in members],
            rule=rule,
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
