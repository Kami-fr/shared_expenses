"""Tests for the manager, against a real SQLite database."""

from __future__ import annotations

from dataclasses import replace
from datetime import UTC, datetime

import pytest

from custom_components.shared_expenses.exceptions import (
    GroupArchivedError,
    GroupNotFoundError,
    InvalidExpenseError,
    InvalidExpenseSharesError,
    InvalidPaymentError,
    MemberAlreadyInGroupError,
)
from custom_components.shared_expenses.manager import SharedExpensesManager
from custom_components.shared_expenses.models import (
    ExpenseShare,
    GroupRole,
    SplitRule,
)
from custom_components.shared_expenses.storage.database import Database

NOW = datetime(2026, 7, 14, 12, 0, tzinfo=UTC)


async def make_group(manager: SharedExpensesManager, **kwargs):
    return await manager.create_group(
        group_name=kwargs.pop("group_name", "Appartement"),
        owner_name=kwargs.pop("owner_name", "Stephane"),
        **kwargs,
    )


async def shares_of(manager: SharedExpensesManager, expense_id: str) -> dict[str, int]:
    return {
        share.member_id: share.amount
        for share in await manager.get_expense_shares(expense_id)
    }


async def owner_of(manager: SharedExpensesManager, group_id: str):
    members = await manager.list_group_members(group_id)

    return next(member for member in members if member.name == "Stephane")


def share_input(member_id: str, amount: int) -> ExpenseShare:
    """Build a share to hand to the manager; the ids are placeholders."""

    return ExpenseShare(
        id="placeholder",
        expense_id="placeholder",
        member_id=member_id,
        amount=amount,
        created_at=NOW,
    )


async def count_rows(database: Database, table: str) -> int:
    cursor = await database.connection.execute(f"SELECT COUNT(*) AS n FROM {table}")
    count = (await cursor.fetchone())["n"]
    await cursor.close()

    return count


async def test_creating_a_group_creates_its_owner(manager: SharedExpensesManager):
    group = await make_group(manager, owner_user_id="ha-user-1")

    members = await manager.list_group_members(group.id)
    memberships = await manager.list_group_memberships(group.id)

    assert [member.name for member in members] == ["Stephane"]
    assert members[0].user_id == "ha-user-1"
    assert memberships[0].role is GroupRole.OWNER


async def test_a_group_starts_without_category(manager: SharedExpensesManager):
    group = await make_group(manager)

    assert await manager.list_categories(group.id) == []


async def test_creating_a_group_is_atomic(
    manager: SharedExpensesManager,
    database: Database,
):
    await make_group(manager)

    assert await count_rows(database, "group_members") == 1


async def test_writes_outside_a_transaction_are_committed(
    manager: SharedExpensesManager,
    database: Database,
):
    """A single-statement write must survive a reconnect, not sit uncommitted."""

    member = await manager.create_member(name="Antonin")

    cursor = await database.connection.execute("PRAGMA journal_mode")
    await cursor.fetchone()
    await cursor.close()

    reloaded = await manager.get_member(member.id)

    assert reloaded.name == "Antonin"


async def test_an_unknown_group_is_refused(manager: SharedExpensesManager):
    with pytest.raises(GroupNotFoundError):
        await manager.get_group("nope")


async def test_archiving_then_restoring_a_group(manager: SharedExpensesManager):
    group = await make_group(manager)

    await manager.archive_group(group.id)
    assert (await manager.get_group(group.id)).archived is True

    await manager.restore_group(group.id)
    assert (await manager.get_group(group.id)).archived is False


async def test_an_archived_group_refuses_new_expenses(manager: SharedExpensesManager):
    group = await make_group(manager)
    owner = (await manager.list_group_members(group.id))[0]

    await manager.archive_group(group.id)

    with pytest.raises(GroupArchivedError):
        await manager.create_expense(
            group_id=group.id,
            title="Courses",
            amount=1000,
            paid_by_member_id=owner.id,
            expense_date=NOW,
        )


async def test_deleting_a_group_cascades(
    manager: SharedExpensesManager,
    database: Database,
):
    group = await make_group(manager)
    owner = (await manager.list_group_members(group.id))[0]

    await manager.create_expense(
        group_id=group.id,
        title="Courses",
        amount=1000,
        paid_by_member_id=owner.id,
        expense_date=NOW,
    )

    await manager.delete_group(group.id)

    for table in ("expenses", "expense_shares", "group_members"):
        assert await count_rows(database, table) == 0, table


async def test_a_member_cannot_join_twice(manager: SharedExpensesManager):
    group = await make_group(manager)
    antonin = await manager.create_member(name="Antonin")

    await manager.add_member_to_group(group_id=group.id, member_id=antonin.id)

    with pytest.raises(MemberAlreadyInGroupError):
        await manager.add_member_to_group(group_id=group.id, member_id=antonin.id)


async def test_a_member_can_belong_to_several_groups(manager: SharedExpensesManager):
    first = await make_group(manager, group_name="Appartement")
    second = await make_group(manager, group_name="Vacances")
    antonin = await manager.create_member(name="Antonin")

    await manager.add_member_to_group(group_id=first.id, member_id=antonin.id)
    await manager.add_member_to_group(group_id=second.id, member_id=antonin.id)

    assert antonin.id in {m.id for m in await manager.list_group_members(first.id)}
    assert antonin.id in {m.id for m in await manager.list_group_members(second.id)}


async def test_a_member_who_left_is_hidden_but_kept(manager: SharedExpensesManager):
    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")

    membership = next(
        m
        for m in await manager.list_group_memberships(group.id)
        if m.member_id == antonin.id
    )
    await manager.remove_member_from_group(membership)

    active = await manager.list_group_members(group.id)
    everyone = await manager.list_group_members(group.id, include_left=True)

    assert antonin.id not in {m.id for m in active}
    assert antonin.id in {m.id for m in everyone}


async def test_an_expense_splits_equally_by_default(manager: SharedExpensesManager):
    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    owner = await owner_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Restaurant",
        amount=5000,
        paid_by_member_id=owner.id,
        expense_date=NOW,
    )

    assert await shares_of(manager, expense.id) == {owner.id: 2500, antonin.id: 2500}


async def test_an_expense_inherits_the_group_currency(manager: SharedExpensesManager):
    group = await make_group(manager, currency="CHF")
    owner = (await manager.list_group_members(group.id))[0]

    expense = await manager.create_expense(
        group_id=group.id,
        title="Restaurant",
        amount=5000,
        paid_by_member_id=owner.id,
        expense_date=NOW,
    )

    assert expense.currency == "CHF"


async def test_the_category_rule_applies_to_its_expenses(
    manager: SharedExpensesManager,
):
    """The reference case, end to end through SQLite."""

    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    owner = await owner_of(manager, group.id)

    courses = await manager.create_category(
        group_id=group.id,
        name="Courses",
        split_rule=SplitRule(cap=1000),
    )

    expense = await manager.create_expense(
        group_id=group.id,
        title="Courses Carrefour",
        amount=8542,
        paid_by_member_id=owner.id,
        expense_date=NOW,
        category_id=courses.id,
    )

    assert await shares_of(manager, expense.id) == {owner.id: 8042, antonin.id: 500}


async def test_the_group_rule_applies_without_category(manager: SharedExpensesManager):
    group = await make_group(manager, split_rule=SplitRule(cap=1000))
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    owner = await owner_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Divers",
        amount=8542,
        paid_by_member_id=owner.id,
        expense_date=NOW,
    )

    assert await shares_of(manager, expense.id) == {owner.id: 8042, antonin.id: 500}


async def test_an_explicit_rule_beats_the_category_rule(manager: SharedExpensesManager):
    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    owner = await owner_of(manager, group.id)

    courses = await manager.create_category(
        group_id=group.id,
        name="Courses",
        split_rule=SplitRule(cap=1000),
    )

    expense = await manager.create_expense(
        group_id=group.id,
        title="Courses",
        amount=5000,
        paid_by_member_id=owner.id,
        expense_date=NOW,
        category_id=courses.id,
        split_rule=SplitRule(),
    )

    assert await shares_of(manager, expense.id) == {owner.id: 2500, antonin.id: 2500}


async def test_a_split_rule_survives_sqlite(manager: SharedExpensesManager):
    group = await make_group(manager)
    rule = SplitRule(participants=("a",), fixed={"b": 250}, cap=1000)

    category = await manager.create_category(
        group_id=group.id,
        name="Courses",
        split_rule=rule,
    )

    assert (await manager.get_category(category.id)).split_rule == rule


async def test_explicit_shares_are_kept(manager: SharedExpensesManager):
    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    owner = await owner_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Cinema",
        amount=3000,
        paid_by_member_id=owner.id,
        expense_date=NOW,
        shares=[share_input(owner.id, 1000), share_input(antonin.id, 2000)],
    )

    assert await shares_of(manager, expense.id) == {owner.id: 1000, antonin.id: 2000}


async def test_shares_that_do_not_add_up_are_refused(manager: SharedExpensesManager):
    group = await make_group(manager)
    owner = (await manager.list_group_members(group.id))[0]

    with pytest.raises(InvalidExpenseSharesError):
        await manager.create_expense(
            group_id=group.id,
            title="Cinema",
            amount=3000,
            paid_by_member_id=owner.id,
            expense_date=NOW,
            shares=[share_input(owner.id, 1000)],
        )


@pytest.mark.parametrize("amount", [0, -500])
async def test_a_non_positive_expense_is_refused(
    manager: SharedExpensesManager,
    amount: int,
):
    group = await make_group(manager)
    owner = (await manager.list_group_members(group.id))[0]

    with pytest.raises(InvalidExpenseError):
        await manager.create_expense(
            group_id=group.id,
            title="Nope",
            amount=amount,
            paid_by_member_id=owner.id,
            expense_date=NOW,
        )


async def test_updating_an_expense_replaces_its_shares(manager: SharedExpensesManager):
    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    owner = await owner_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Restaurant",
        amount=5000,
        paid_by_member_id=owner.id,
        expense_date=NOW,
    )

    await manager.update_expense(replace(expense, amount=8000))

    assert await shares_of(manager, expense.id) == {owner.id: 4000, antonin.id: 4000}


async def test_updating_an_expense_with_explicit_shares(manager: SharedExpensesManager):
    """What the edit dialog sends: the shares it shows, verbatim."""

    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    owner = await owner_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Restaurant",
        amount=5000,
        paid_by_member_id=owner.id,
        expense_date=NOW,
    )

    await manager.update_expense(
        replace(expense, amount=6000),
        [share_input(owner.id, 1000), share_input(antonin.id, 5000)],
    )

    assert await shares_of(manager, expense.id) == {owner.id: 1000, antonin.id: 5000}


async def test_updating_an_expense_keeps_a_single_row(manager: SharedExpensesManager):
    """Replacing the shares must not pile them up."""

    group = await make_group(manager)
    await manager.create_group_member(group_id=group.id, name="Antonin")
    owner = await owner_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Restaurant",
        amount=5000,
        paid_by_member_id=owner.id,
        expense_date=NOW,
    )

    await manager.update_expense(replace(expense, amount=8000))
    await manager.update_expense(replace(expense, amount=9000))

    shares = await manager.get_expense_shares(expense.id)

    assert len(shares) == 2
    assert sum(share.amount for share in shares) == 9000


async def test_updating_an_expense_with_wrong_shares_is_refused(
    manager: SharedExpensesManager,
):
    group = await make_group(manager)
    owner = await owner_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Restaurant",
        amount=5000,
        paid_by_member_id=owner.id,
        expense_date=NOW,
    )

    with pytest.raises(InvalidExpenseSharesError):
        await manager.update_expense(expense, [share_input(owner.id, 1)])


async def test_deleting_an_expense_clears_its_shares_and_balances(
    manager: SharedExpensesManager,
    database: Database,
):
    group = await make_group(manager)
    await manager.create_group_member(group_id=group.id, name="Antonin")
    owner = await owner_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Essence",
        amount=4000,
        paid_by_member_id=owner.id,
        expense_date=NOW,
    )

    await manager.delete_expense(expense.id)

    assert await count_rows(database, "expense_shares") == 0

    result = await manager.get_balances(group.id)

    assert set(result.balances.values()) == {0}


async def test_a_payment_to_oneself_is_refused(manager: SharedExpensesManager):
    group = await make_group(manager)
    owner = (await manager.list_group_members(group.id))[0]

    with pytest.raises(InvalidPaymentError):
        await manager.create_payment(
            group_id=group.id,
            from_member_id=owner.id,
            to_member_id=owner.id,
            amount=1000,
            payment_date=NOW,
        )


async def test_a_non_positive_payment_is_refused(manager: SharedExpensesManager):
    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    owner = await owner_of(manager, group.id)

    with pytest.raises(InvalidPaymentError):
        await manager.create_payment(
            group_id=group.id,
            from_member_id=antonin.id,
            to_member_id=owner.id,
            amount=-100,
            payment_date=NOW,
        )


async def test_balances_and_settlement_end_to_end(manager: SharedExpensesManager):
    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    owner = await owner_of(manager, group.id)

    await manager.create_expense(
        group_id=group.id,
        title="Essence",
        amount=4000,
        paid_by_member_id=owner.id,
        expense_date=NOW,
    )

    result = await manager.get_balances(group.id)

    assert result.balances == {owner.id: 2000, antonin.id: -2000}

    transfers = [
        (s.from_member_id, s.to_member_id, s.amount) for s in result.settlements
    ]

    assert transfers == [(antonin.id, owner.id, 2000)]

    await manager.create_payment(
        group_id=group.id,
        from_member_id=antonin.id,
        to_member_id=owner.id,
        amount=2000,
        payment_date=NOW,
    )

    after = await manager.get_balances(group.id)

    assert set(after.balances.values()) == {0}
    assert after.settlements == []
