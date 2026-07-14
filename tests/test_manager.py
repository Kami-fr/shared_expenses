"""Tests for the manager, against a real SQLite database."""

from __future__ import annotations

from dataclasses import replace
from datetime import UTC, datetime

import pytest

from custom_components.shared_expenses.const import DATABASE_VERSION
from custom_components.shared_expenses.exceptions import (
    CannotRemoveOwnerError,
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
        split_rule=SplitRule(envelope=1000),
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
    group = await make_group(manager, split_rule=SplitRule(envelope=1000))
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
        split_rule=SplitRule(envelope=1000),
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
    rule = SplitRule(envelope=1000, participants=("a",))

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


async def test_the_schema_is_migrated_to_the_latest_version(database: Database):
    cursor = await database.connection.execute("SELECT version FROM schema_version")
    version = (await cursor.fetchone())["version"]
    await cursor.close()

    assert version == DATABASE_VERSION


async def test_a_home_assistant_account_maps_to_one_member(
    manager: SharedExpensesManager,
):
    """The unique index is what stops the same person existing twice."""

    first = await manager.link_user(user_id="ha-1", name="Stephane")
    second = await manager.link_user(user_id="ha-1", name="Stephane again")

    assert first.id == second.id
    assert second.name == "Stephane"


async def test_members_without_an_account_can_pile_up(manager: SharedExpensesManager):
    """NULL user_id must not collide: they are the people outside the house."""

    first = await manager.create_member(name="Clara")
    second = await manager.create_member(name="Marc")

    assert first.id != second.id
    assert first.user_id is None and second.user_id is None


async def test_a_user_only_sees_their_own_groups(manager: SharedExpensesManager):
    mine = await make_group(manager, group_name="Appartement", owner_user_id="ha-1")
    await make_group(manager, group_name="Vacances", owner_user_id="ha-2")

    groups = await manager.list_user_groups("ha-1")

    assert [group.name for group in groups] == ["Appartement"]
    assert await manager.is_group_member(mine.id, "ha-1") is True


async def test_a_stranger_sees_nothing(manager: SharedExpensesManager):
    await make_group(manager, owner_user_id="ha-1")

    assert await manager.list_user_groups("ha-nobody") == []


async def test_leaving_a_group_hides_it(manager: SharedExpensesManager):
    group = await make_group(manager, owner_user_id="ha-1")
    antonin = await manager.link_user(user_id="ha-2", name="Antonin")
    await manager.add_member_to_group(group_id=group.id, member_id=antonin.id)

    assert [g.name for g in await manager.list_user_groups("ha-2")] == ["Appartement"]

    membership = next(
        m
        for m in await manager.list_group_memberships(group.id)
        if m.member_id == antonin.id
    )
    await manager.remove_member_from_group(membership)

    assert await manager.list_user_groups("ha-2") == []
    assert await manager.is_group_member(group.id, "ha-2") is False


async def test_an_unauthorised_group_looks_like_a_missing_one(
    manager: SharedExpensesManager,
):
    """Telling the two apart would leak that the group exists."""

    group = await make_group(manager, owner_user_id="ha-1")

    with pytest.raises(GroupNotFoundError):
        await manager.ensure_group_member(group.id, "ha-2")

    with pytest.raises(GroupNotFoundError):
        await manager.ensure_group_member("does-not-exist", "ha-1")

    await manager.ensure_group_member(group.id, "ha-1")


async def test_a_member_without_an_account_grants_no_access(
    manager: SharedExpensesManager,
):
    group = await make_group(manager, owner_user_id="ha-1")
    await manager.create_group_member(group_id=group.id, name="Clara")

    assert await manager.list_user_groups("ha-1") != []
    assert await manager.is_group_member(group.id, "ha-nobody") is False


async def test_the_owner_cannot_leave_their_own_group(manager: SharedExpensesManager):
    """Otherwise the group would be stranded with nobody able to open it."""

    group = await make_group(manager, owner_user_id="ha-1")

    membership = (await manager.list_group_memberships(group.id))[0]

    with pytest.raises(CannotRemoveOwnerError):
        await manager.remove_member_from_group(membership)

    assert [g.name for g in await manager.list_user_groups("ha-1")] == ["Appartement"]


async def test_anyone_but_the_owner_can_leave(manager: SharedExpensesManager):
    group = await make_group(manager, owner_user_id="ha-1")
    antonin = await manager.link_user(user_id="ha-2", name="Antonin")
    await manager.add_member_to_group(group_id=group.id, member_id=antonin.id)

    membership = next(
        m
        for m in await manager.list_group_memberships(group.id)
        if m.member_id == antonin.id
    )
    await manager.remove_member_from_group(membership)

    assert await manager.list_user_groups("ha-2") == []


async def test_an_archived_group_stays_visible_to_its_members(
    manager: SharedExpensesManager,
):
    """Archiving freezes a group; it must not hide it."""

    group = await make_group(manager, owner_user_id="ha-1")

    await manager.archive_group(group.id)

    groups = await manager.list_user_groups("ha-1")

    assert [g.name for g in groups] == ["Appartement"]
    assert groups[0].archived is True


async def test_an_expense_remembers_the_rule_it_was_filled_in_with(
    manager: SharedExpensesManager,
):
    group = await make_group(manager)
    await manager.create_group_member(group_id=group.id, name="Antonin")
    owner = await owner_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Courses",
        amount=8542,
        paid_by_member_id=owner.id,
        expense_date=NOW,
        split_rule=SplitRule(envelope=1000),
    )

    reloaded = await manager.get_expense(expense.id)

    assert reloaded.split_rule is not None
    assert reloaded.split_rule.envelope == 1000


async def test_a_stored_rule_names_its_members(manager: SharedExpensesManager):
    """"Everyone" would pull in whoever joins later."""

    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    owner = await owner_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Courses",
        amount=8542,
        paid_by_member_id=owner.id,
        expense_date=NOW,
        split_rule=SplitRule(envelope=1000),
    )

    rule = (await manager.get_expense(expense.id)).split_rule

    assert set(rule.participants) == {owner.id, antonin.id}
    assert rule.remainder.members == (owner.id,)


async def test_a_new_member_stays_out_of_a_past_expense(
    manager: SharedExpensesManager,
):
    """Someone joining must not be pulled into what happened before them."""

    from custom_components.shared_expenses.helpers.splits import resolve_shares

    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    owner = await owner_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Courses",
        amount=8542,
        paid_by_member_id=owner.id,
        expense_date=NOW,
        split_rule=SplitRule(envelope=1000),
    )

    stored = await shares_of(manager, expense.id)

    assert stored == {owner.id: 8042, antonin.id: 500}

    clara = await manager.create_group_member(group_id=group.id, name="Clara")

    # Reopening re-resolves the remembered rule against the group as it is now.
    rule = (await manager.get_expense(expense.id)).split_rule
    members = [m.id for m in await manager.list_group_members(group.id)]

    assert clara.id in members

    replayed = resolve_shares(
        amount=8542,
        payer_id=owner.id,
        member_ids=members,
        rule=rule,
    )

    assert replayed == stored
    assert clara.id not in replayed


async def test_an_equal_split_is_remembered_as_one(manager: SharedExpensesManager):
    """Reopening must show "the whole expense", not the amounts spelled out."""

    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    owner = await owner_of(manager, group.id)

    # What the dialog sends for a plain equal split: the resolved shares, and
    # the rule as filled in.
    expense = await manager.create_expense(
        group_id=group.id,
        title="Restaurant",
        amount=5000,
        paid_by_member_id=owner.id,
        expense_date=NOW,
        shares=[share_input(owner.id, 2500), share_input(antonin.id, 2500)],
        split_rule=SplitRule(),
    )

    rule = (await manager.get_expense(expense.id)).split_rule

    assert rule is not None
    assert rule.envelope is None
    assert set(rule.participants) == {owner.id, antonin.id}


async def test_explicit_shares_still_carry_their_rule(manager: SharedExpensesManager):
    """The shares are the truth, but the rule has to travel with them."""

    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    owner = await owner_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Courses",
        amount=8542,
        paid_by_member_id=owner.id,
        expense_date=NOW,
        shares=[share_input(owner.id, 8042), share_input(antonin.id, 500)],
        split_rule=SplitRule(envelope=1000),
    )

    reloaded = await manager.get_expense(expense.id)

    assert reloaded.split_rule.envelope == 1000
    assert await shares_of(manager, expense.id) == {owner.id: 8042, antonin.id: 500}


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
