"""Tests for the manager, against a real SQLite database."""

from __future__ import annotations

from dataclasses import replace
from datetime import UTC, datetime

import pytest

from custom_components.shared_expenses.const import DATABASE_VERSION
from custom_components.shared_expenses.exceptions import (
    CannotRemoveAdminError,
    CategoryNotFoundError,
    GroupArchivedError,
    GroupNotFoundError,
    InvalidExchangeRateError,
    InvalidExpenseError,
    InvalidExpenseSharesError,
    InvalidPaymentError,
    MemberAlreadyInGroupError,
)
from custom_components.shared_expenses.manager import SharedExpensesManager
from custom_components.shared_expenses.models import (
    ExpenseShare,
    GroupRole,
    PaymentKind,
    Remainder,
    SplitRule,
)
from custom_components.shared_expenses.storage.database import Database

NOW = datetime(2026, 7, 14, 12, 0, tzinfo=UTC)


async def make_group(manager: SharedExpensesManager, **kwargs):
    return await manager.create_group(
        group_name=kwargs.pop("group_name", "Appartement"),
        admin_name=kwargs.pop("admin_name", "Stephane"),
        **kwargs,
    )


async def shares_of(manager: SharedExpensesManager, expense_id: str) -> dict[str, int]:
    return {
        share.member_id: share.amount
        for share in await manager.get_expense_shares(expense_id)
    }


async def admin_of(manager: SharedExpensesManager, group_id: str):
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


async def test_creating_a_group_creates_its_admin(manager: SharedExpensesManager):
    group = await make_group(manager, admin_user_id="ha-user-1")

    members = await manager.list_group_members(group.id)
    memberships = await manager.list_group_memberships(group.id)

    assert [member.name for member in members] == ["Stephane"]
    assert members[0].user_id == "ha-user-1"
    assert memberships[0].role is GroupRole.ADMIN


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
    admin = (await manager.list_group_members(group.id))[0]

    await manager.archive_group(group.id)

    with pytest.raises(GroupArchivedError):
        await manager.create_expense(
            group_id=group.id,
            title="Courses",
            amount=1000,
            paid_by_member_id=admin.id,
            expense_date=NOW,
        )


async def test_deleting_a_group_cascades(
    manager: SharedExpensesManager,
    database: Database,
):
    group = await make_group(manager)
    admin = (await manager.list_group_members(group.id))[0]

    await manager.create_expense(
        group_id=group.id,
        title="Courses",
        amount=1000,
        paid_by_member_id=admin.id,
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
    admin = await admin_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Restaurant",
        amount=5000,
        paid_by_member_id=admin.id,
        expense_date=NOW,
    )

    assert await shares_of(manager, expense.id) == {admin.id: 2500, antonin.id: 2500}


async def test_an_expense_inherits_the_group_currency(manager: SharedExpensesManager):
    group = await make_group(manager, currency="CHF")
    admin = (await manager.list_group_members(group.id))[0]

    expense = await manager.create_expense(
        group_id=group.id,
        title="Restaurant",
        amount=5000,
        paid_by_member_id=admin.id,
        expense_date=NOW,
    )

    assert expense.currency == "CHF"


async def test_the_category_rule_applies_to_its_expenses(
    manager: SharedExpensesManager,
):
    """The reference case, end to end through SQLite."""

    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    courses = await manager.create_category(
        group_id=group.id,
        name="Courses",
        split_rule=SplitRule(envelope=1000),
    )

    expense = await manager.create_expense(
        group_id=group.id,
        title="Courses Carrefour",
        amount=8542,
        paid_by_member_id=admin.id,
        expense_date=NOW,
        category_id=courses.id,
    )

    assert await shares_of(manager, expense.id) == {admin.id: 8042, antonin.id: 500}


async def test_the_group_rule_applies_without_category(manager: SharedExpensesManager):
    group = await make_group(manager, split_rule=SplitRule(envelope=1000))
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Divers",
        amount=8542,
        paid_by_member_id=admin.id,
        expense_date=NOW,
    )

    assert await shares_of(manager, expense.id) == {admin.id: 8042, antonin.id: 500}


async def test_an_explicit_rule_beats_the_category_rule(manager: SharedExpensesManager):
    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    courses = await manager.create_category(
        group_id=group.id,
        name="Courses",
        split_rule=SplitRule(envelope=1000),
    )

    expense = await manager.create_expense(
        group_id=group.id,
        title="Courses",
        amount=5000,
        paid_by_member_id=admin.id,
        expense_date=NOW,
        category_id=courses.id,
        split_rule=SplitRule(),
    )

    assert await shares_of(manager, expense.id) == {admin.id: 2500, antonin.id: 2500}


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
    admin = await admin_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Cinema",
        amount=3000,
        paid_by_member_id=admin.id,
        expense_date=NOW,
        shares=[share_input(admin.id, 1000), share_input(antonin.id, 2000)],
    )

    assert await shares_of(manager, expense.id) == {admin.id: 1000, antonin.id: 2000}


async def test_shares_that_do_not_add_up_are_refused(manager: SharedExpensesManager):
    group = await make_group(manager)
    admin = (await manager.list_group_members(group.id))[0]

    with pytest.raises(InvalidExpenseSharesError):
        await manager.create_expense(
            group_id=group.id,
            title="Cinema",
            amount=3000,
            paid_by_member_id=admin.id,
            expense_date=NOW,
            shares=[share_input(admin.id, 1000)],
        )


@pytest.mark.parametrize("amount", [0, -500])
async def test_a_non_positive_expense_is_refused(
    manager: SharedExpensesManager,
    amount: int,
):
    group = await make_group(manager)
    admin = (await manager.list_group_members(group.id))[0]

    with pytest.raises(InvalidExpenseError):
        await manager.create_expense(
            group_id=group.id,
            title="Nope",
            amount=amount,
            paid_by_member_id=admin.id,
            expense_date=NOW,
        )


async def test_updating_an_expense_replaces_its_shares(manager: SharedExpensesManager):
    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Restaurant",
        amount=5000,
        paid_by_member_id=admin.id,
        expense_date=NOW,
    )

    await manager.update_expense(replace(expense, amount=8000))

    assert await shares_of(manager, expense.id) == {admin.id: 4000, antonin.id: 4000}


async def test_updating_an_expense_with_explicit_shares(manager: SharedExpensesManager):
    """What the edit dialog sends: the shares it shows, verbatim."""

    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Restaurant",
        amount=5000,
        paid_by_member_id=admin.id,
        expense_date=NOW,
    )

    await manager.update_expense(
        replace(expense, amount=6000),
        [share_input(admin.id, 1000), share_input(antonin.id, 5000)],
    )

    assert await shares_of(manager, expense.id) == {admin.id: 1000, antonin.id: 5000}


async def test_updating_an_expense_keeps_a_single_row(manager: SharedExpensesManager):
    """Replacing the shares must not pile them up."""

    group = await make_group(manager)
    await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Restaurant",
        amount=5000,
        paid_by_member_id=admin.id,
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
    admin = await admin_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Restaurant",
        amount=5000,
        paid_by_member_id=admin.id,
        expense_date=NOW,
    )

    with pytest.raises(InvalidExpenseSharesError):
        await manager.update_expense(expense, [share_input(admin.id, 1)])


async def test_deleting_an_expense_clears_its_shares_and_balances(
    manager: SharedExpensesManager,
    database: Database,
):
    group = await make_group(manager)
    await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Essence",
        amount=4000,
        paid_by_member_id=admin.id,
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
    mine = await make_group(manager, group_name="Appartement", admin_user_id="ha-1")
    await make_group(manager, group_name="Vacances", admin_user_id="ha-2")

    groups = await manager.list_user_groups("ha-1")

    assert [group.name for group in groups] == ["Appartement"]
    assert await manager.is_group_member(mine.id, "ha-1") is True


async def test_a_stranger_sees_nothing(manager: SharedExpensesManager):
    await make_group(manager, admin_user_id="ha-1")

    assert await manager.list_user_groups("ha-nobody") == []


async def test_leaving_a_group_hides_it(manager: SharedExpensesManager):
    group = await make_group(manager, admin_user_id="ha-1")
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

    group = await make_group(manager, admin_user_id="ha-1")

    with pytest.raises(GroupNotFoundError):
        await manager.ensure_group_member(group.id, "ha-2")

    with pytest.raises(GroupNotFoundError):
        await manager.ensure_group_member("does-not-exist", "ha-1")

    await manager.ensure_group_member(group.id, "ha-1")


async def test_a_member_without_an_account_grants_no_access(
    manager: SharedExpensesManager,
):
    group = await make_group(manager, admin_user_id="ha-1")
    await manager.create_group_member(group_id=group.id, name="Clara")

    assert await manager.list_user_groups("ha-1") != []
    assert await manager.is_group_member(group.id, "ha-nobody") is False


async def test_the_admin_cannot_leave_their_own_group(manager: SharedExpensesManager):
    """Otherwise the group would be stranded with nobody able to open it."""

    group = await make_group(manager, admin_user_id="ha-1")

    membership = (await manager.list_group_memberships(group.id))[0]

    with pytest.raises(CannotRemoveAdminError):
        await manager.remove_member_from_group(membership)

    assert [g.name for g in await manager.list_user_groups("ha-1")] == ["Appartement"]


async def test_anyone_but_the_admin_can_leave(manager: SharedExpensesManager):
    group = await make_group(manager, admin_user_id="ha-1")
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

    group = await make_group(manager, admin_user_id="ha-1")

    await manager.archive_group(group.id)

    groups = await manager.list_user_groups("ha-1")

    assert [g.name for g in groups] == ["Appartement"]
    assert groups[0].archived is True


async def test_an_expense_remembers_the_rule_it_was_filled_in_with(
    manager: SharedExpensesManager,
):
    group = await make_group(manager)
    await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Courses",
        amount=8542,
        paid_by_member_id=admin.id,
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
    admin = await admin_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Courses",
        amount=8542,
        paid_by_member_id=admin.id,
        expense_date=NOW,
        split_rule=SplitRule(envelope=1000),
    )

    rule = (await manager.get_expense(expense.id)).split_rule

    assert set(rule.participants) == {admin.id, antonin.id}
    assert rule.remainder.members == (admin.id,)


async def test_a_new_member_stays_out_of_a_past_expense(
    manager: SharedExpensesManager,
):
    """Someone joining must not be pulled into what happened before them."""

    from custom_components.shared_expenses.helpers.splits import resolve_shares

    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Courses",
        amount=8542,
        paid_by_member_id=admin.id,
        expense_date=NOW,
        split_rule=SplitRule(envelope=1000),
    )

    stored = await shares_of(manager, expense.id)

    assert stored == {admin.id: 8042, antonin.id: 500}

    clara = await manager.create_group_member(group_id=group.id, name="Clara")

    # Reopening re-resolves the remembered rule against the group as it is now.
    rule = (await manager.get_expense(expense.id)).split_rule
    members = [m.id for m in await manager.list_group_members(group.id)]

    assert clara.id in members

    replayed = resolve_shares(
        amount=8542,
        payer_id=admin.id,
        member_ids=members,
        rule=rule,
    )

    assert replayed == stored
    assert clara.id not in replayed


async def test_an_equal_split_is_remembered_as_one(manager: SharedExpensesManager):
    """Reopening must show "the whole expense", not the amounts spelled out."""

    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    # What the dialog sends for a plain equal split: the resolved shares, and
    # the rule as filled in.
    expense = await manager.create_expense(
        group_id=group.id,
        title="Restaurant",
        amount=5000,
        paid_by_member_id=admin.id,
        expense_date=NOW,
        shares=[share_input(admin.id, 2500), share_input(antonin.id, 2500)],
        split_rule=SplitRule(),
    )

    rule = (await manager.get_expense(expense.id)).split_rule

    assert rule is not None
    assert rule.envelope is None
    assert set(rule.participants) == {admin.id, antonin.id}


async def test_explicit_shares_still_carry_their_rule(manager: SharedExpensesManager):
    """The shares are the truth, but the rule has to travel with them."""

    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Courses",
        amount=8542,
        paid_by_member_id=admin.id,
        expense_date=NOW,
        shares=[share_input(admin.id, 8042), share_input(antonin.id, 500)],
        split_rule=SplitRule(envelope=1000),
    )

    reloaded = await manager.get_expense(expense.id)

    assert reloaded.split_rule.envelope == 1000
    assert await shares_of(manager, expense.id) == {admin.id: 8042, antonin.id: 500}


async def test_expenses_of_one_day_come_back_newest_entered_first(
    manager: SharedExpensesManager,
):
    """A date input carries no time: they all share one expense_date."""

    group = await make_group(manager)
    admin = await admin_of(manager, group.id)

    for title in ("premiere", "deuxieme", "troisieme"):
        await manager.create_expense(
            group_id=group.id,
            title=title,
            amount=1000,
            paid_by_member_id=admin.id,
            expense_date=NOW,
        )

    expenses = await manager.list_expenses(group.id)

    assert [e.title for e in expenses] == ["troisieme", "deuxieme", "premiere"]


async def test_a_backdated_expense_stays_in_the_past(manager: SharedExpensesManager):
    group = await make_group(manager)
    admin = await admin_of(manager, group.id)

    await manager.create_expense(
        group_id=group.id,
        title="aujourd'hui",
        amount=1000,
        paid_by_member_id=admin.id,
        expense_date=NOW,
    )
    await manager.create_expense(
        group_id=group.id,
        title="le mois dernier",
        amount=1000,
        paid_by_member_id=admin.id,
        expense_date=datetime(2026, 6, 1, 12, 0, tzinfo=UTC),
    )

    expenses = await manager.list_expenses(group.id)

    assert [e.title for e in expenses] == ["aujourd'hui", "le mois dernier"]


async def test_a_guest_is_hidden_then_brought_back(manager: SharedExpensesManager):
    """Removing someone sets them aside; it must never lose their past."""

    group = await make_group(manager)
    clara = await manager.create_group_member(group_id=group.id, name="Clara")

    expense = await manager.create_expense(
        group_id=group.id,
        title="Courses",
        amount=1000,
        paid_by_member_id=clara.id,
        expense_date=NOW,
    )

    membership = next(
        m
        for m in await manager.list_group_memberships(group.id)
        if m.member_id == clara.id
    )
    await manager.remove_member_from_group(membership)

    active = {m.name for m in await manager.list_group_members(group.id)}
    everyone = {
        m.name for m in await manager.list_group_members(group.id, include_left=True)
    }

    assert "Clara" not in active
    assert "Clara" in everyone
    assert (await manager.get_expense(expense.id)).paid_by_member_id == clara.id

    await manager.add_member_to_group(group_id=group.id, member_id=clara.id)

    assert "Clara" in {m.name for m in await manager.list_group_members(group.id)}


async def test_a_payment_to_oneself_is_refused(manager: SharedExpensesManager):
    group = await make_group(manager)
    admin = (await manager.list_group_members(group.id))[0]

    with pytest.raises(InvalidPaymentError):
        await manager.create_payment(
            group_id=group.id,
            from_member_id=admin.id,
            to_member_id=admin.id,
            amount=1000,
            payment_date=NOW,
        )


async def test_a_non_positive_payment_is_refused(manager: SharedExpensesManager):
    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    with pytest.raises(InvalidPaymentError):
        await manager.create_payment(
            group_id=group.id,
            from_member_id=antonin.id,
            to_member_id=admin.id,
            amount=-100,
            payment_date=NOW,
        )


async def test_the_group_currency_is_what_an_expense_gets(
    manager: SharedExpensesManager,
):
    """Saying it plainly is allowed; it is only a different one that is not."""

    group = await make_group(manager, currency="CHF")
    admin = await admin_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Fondue",
        amount=10000,
        currency="CHF",
        paid_by_member_id=admin.id,
        expense_date=NOW,
    )

    assert expense.currency == "CHF"


async def test_someone_who_left_can_still_settle_up(manager: SharedExpensesManager):
    """Leaving a group does not clear a debt; it must stay payable."""

    group = await make_group(manager)
    clara = await manager.create_group_member(group_id=group.id, name="Clara")
    admin = await admin_of(manager, group.id)

    await manager.create_expense(
        group_id=group.id,
        title="Courses",
        amount=4000,
        paid_by_member_id=admin.id,
        expense_date=NOW,
    )

    membership = next(
        m
        for m in await manager.list_group_memberships(group.id)
        if m.member_id == clara.id
    )
    await manager.remove_member_from_group(membership)

    # Gone, and still owing: the balances count her, so she can be paid for.
    before = await manager.get_balances(group.id)

    assert before.balances[clara.id] == -2000

    await manager.create_payment(
        group_id=group.id,
        from_member_id=clara.id,
        to_member_id=admin.id,
        amount=2000,
        payment_date=NOW,
    )

    after = await manager.get_balances(group.id)

    assert after.balances == {admin.id: 0, clara.id: 0}
    assert after.settlements == []


async def test_a_corrected_payment_moves_the_balance(manager: SharedExpensesManager):
    """A payment typed wrong is worth correcting, not deleting and retyping."""

    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    await manager.create_expense(
        group_id=group.id,
        title="Essence",
        amount=4000,
        paid_by_member_id=admin.id,
        expense_date=NOW,
    )

    payment = await manager.create_payment(
        group_id=group.id,
        from_member_id=antonin.id,
        to_member_id=admin.id,
        amount=500,
        payment_date=NOW,
    )

    await manager.update_payment(replace(payment, amount=2000))

    result = await manager.get_balances(group.id)

    assert result.balances == {admin.id: 0, antonin.id: 0}
    assert result.settlements == []
    assert (await manager.get_payment(payment.id)).amount == 2000


async def test_a_payment_corrected_to_oneself_is_refused(
    manager: SharedExpensesManager,
):
    """The rules of a payment hold on the way in and on every change after."""

    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    payment = await manager.create_payment(
        group_id=group.id,
        from_member_id=antonin.id,
        to_member_id=admin.id,
        amount=500,
        payment_date=NOW,
    )

    with pytest.raises(InvalidPaymentError):
        await manager.update_payment(replace(payment, to_member_id=antonin.id))

    assert (await manager.get_payment(payment.id)).to_member_id == admin.id


async def test_balances_and_settlement_end_to_end(manager: SharedExpensesManager):
    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    await manager.create_expense(
        group_id=group.id,
        title="Essence",
        amount=4000,
        paid_by_member_id=admin.id,
        expense_date=NOW,
    )

    result = await manager.get_balances(group.id)

    assert result.balances == {admin.id: 2000, antonin.id: -2000}

    transfers = [
        (s.from_member_id, s.to_member_id, s.amount) for s in result.settlements
    ]

    assert transfers == [(antonin.id, admin.id, 2000)]

    await manager.create_payment(
        group_id=group.id,
        from_member_id=antonin.id,
        to_member_id=admin.id,
        amount=2000,
        payment_date=NOW,
    )

    after = await manager.get_balances(group.id)

    assert set(after.balances.values()) == {0}
    assert after.settlements == []

async def test_a_category_can_be_an_equal_split_when_the_group_is_not(
    manager: SharedExpensesManager,
):
    """A rule that says "equal shares" must not be mistaken for saying nothing.

    Saying nothing sends the expense to the group's rule. A category spelling
    out an equal split says the opposite, and the two are different rules even
    though they resolve the same when the group has none.
    """

    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    await manager.update_group(
        replace(
            group,
            split_rule=SplitRule(
                envelope=0,
                remainder=Remainder(
                    members=(admin.id, antonin.id),
                    percent={admin.id: 6000, antonin.id: 4000},
                ),
            ),
        )
    )

    spelled_out = SplitRule(envelope=None, participants=None, remainder=Remainder())
    category = await manager.create_category(
        group_id=group.id,
        name="Courses",
        split_rule=spelled_out,
    )

    expense = await manager.create_expense(
        group_id=group.id,
        title="Courses",
        amount=10000,
        paid_by_member_id=admin.id,
        expense_date=NOW,
        category_id=category.id,
    )

    assert await shares_of(manager, expense.id) == {admin.id: 5000, antonin.id: 5000}


async def test_a_category_with_no_rule_takes_the_group_one(
    manager: SharedExpensesManager,
):
    """The other half of it: saying nothing still defers, as it always did."""

    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    await manager.update_group(
        replace(
            group,
            split_rule=SplitRule(
                envelope=0,
                remainder=Remainder(
                    members=(admin.id, antonin.id),
                    percent={admin.id: 6000, antonin.id: 4000},
                ),
            ),
        )
    )

    category = await manager.create_category(
        group_id=group.id,
        name="Courses",
        split_rule=None,
    )

    expense = await manager.create_expense(
        group_id=group.id,
        title="Courses",
        amount=10000,
        paid_by_member_id=admin.id,
        expense_date=NOW,
        category_id=category.id,
    )

    assert await shares_of(manager, expense.id) == {admin.id: 6000, antonin.id: 4000}

async def test_a_group_can_name_a_default_category(manager: SharedExpensesManager):
    """Most households spend on the same thing; picking it every time says nothing."""

    group = await make_group(manager)
    category = await manager.create_category(group_id=group.id, name="Courses")

    await manager.update_group(replace(group, default_category_id=category.id))

    assert (await manager.get_group(group.id)).default_category_id == category.id


async def test_a_default_category_of_another_group_is_refused(
    manager: SharedExpensesManager,
):
    """The id comes from the caller: a foreign key would take any in the house."""

    mine = await make_group(manager, group_name="Appartement")
    theirs = await make_group(manager, group_name="Ski")
    theirs_category = await manager.create_category(group_id=theirs.id, name="Forfaits")

    with pytest.raises(CategoryNotFoundError):
        await manager.update_group(
            replace(mine, default_category_id=theirs_category.id)
        )

    assert (await manager.get_group(mine.id)).default_category_id is None


async def test_deleting_the_default_category_leaves_the_group(
    manager: SharedExpensesManager,
):
    """It stops having a default, which is where it started. Nothing more."""

    group = await make_group(manager)
    category = await manager.create_category(group_id=group.id, name="Courses")

    await manager.update_group(replace(group, default_category_id=category.id))
    await manager.delete_category(category.id)

    reloaded = await manager.get_group(group.id)

    assert reloaded.name == "Appartement"
    assert reloaded.default_category_id is None

async def test_an_expense_in_another_currency_converts(manager: SharedExpensesManager):
    """100 USD at 0.87681 is 87,68 EUR, and that is what the group counts."""

    group = await make_group(manager, currency="EUR")
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Diner a New York",
        amount=10_000,
        currency="USD",
        paid_by_member_id=admin.id,
        expense_date=NOW,
        exchange_rate=876_810,
    )

    # What was handed over at the till, kept as it was.
    assert expense.amount == 10_000
    assert expense.currency == "USD"

    # And the same money, in the currency the group keeps its books in.
    assert expense.converted_amount == 8_768
    assert expense.exchange_rate == 876_810

    # The shares are in the group's currency and add up to the converted total.
    shares = await shares_of(manager, expense.id)

    assert sum(shares.values()) == 8_768
    assert shares == {admin.id: 4_384, antonin.id: 4_384}


async def test_a_converted_expense_settles_against_a_local_one(
    manager: SharedExpensesManager,
):
    """The whole point of converting at all.

    Before, 100 USD cleared 100 EUR and left two people thinking they were
    square.
    """

    group = await make_group(manager, currency="EUR")
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    # Stephane pays 100 USD, worth 87,68 EUR.
    await manager.create_expense(
        group_id=group.id,
        title="Diner",
        amount=10_000,
        currency="USD",
        paid_by_member_id=admin.id,
        expense_date=NOW,
        exchange_rate=876_810,
    )

    # Antonin pays 100 EUR.
    await manager.create_expense(
        group_id=group.id,
        title="Courses",
        amount=10_000,
        paid_by_member_id=antonin.id,
        expense_date=NOW,
    )

    result = await manager.get_balances(group.id)

    # Each bore half of both: (87,68 + 100) / 2 = 93,84 each.
    # Stephane put in 87,68 and bore 93,84, so he owes 6,16.
    # Antonin put in 100,00 and bore 93,84, so he is owed 6,16.
    assert result.balances == {admin.id: -616, antonin.id: 616}
    assert sum(result.balances.values()) == 0


async def test_the_group_currency_needs_no_rate(manager: SharedExpensesManager):
    """The overwhelming case: nothing to fetch, nothing to convert."""

    group = await make_group(manager, currency="EUR")
    admin = await admin_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Courses",
        amount=8_542,
        currency="EUR",
        paid_by_member_id=admin.id,
        expense_date=NOW,
    )

    assert expense.converted_amount == expense.amount
    assert expense.exchange_rate == 1_000_000
    assert expense.rate_as_of is None


async def test_editing_a_converted_expense_keeps_its_rate(
    manager: SharedExpensesManager,
):
    """What someone owes was settled on the day they were owed it.

    Re-pricing an old expense at today's rate on every save would rewrite the
    past, quietly, every time somebody fixed a typo in its title.
    """

    group = await make_group(manager, currency="EUR")
    await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Diner",
        amount=10_000,
        currency="USD",
        paid_by_member_id=admin.id,
        expense_date=NOW,
        exchange_rate=876_810,
    )

    # A typo in the title, nothing else. No rate given, and no network here:
    # the expense's own rate is what it keeps.
    await manager.update_expense(replace(expense, title="Diner a New York"))

    reloaded = await manager.get_expense(expense.id)

    assert reloaded.title == "Diner a New York"
    assert reloaded.exchange_rate == 876_810
    assert reloaded.converted_amount == 8_768


async def test_an_amount_edited_is_reconverted_at_the_same_rate(
    manager: SharedExpensesManager,
):
    group = await make_group(manager, currency="EUR")
    await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Diner",
        amount=10_000,
        currency="USD",
        paid_by_member_id=admin.id,
        expense_date=NOW,
        exchange_rate=876_810,
    )

    await manager.update_expense(replace(expense, amount=20_000))

    reloaded = await manager.get_expense(expense.id)

    assert reloaded.converted_amount == 17_536
    assert reloaded.exchange_rate == 876_810


async def test_an_implausible_rate_is_refused(manager: SharedExpensesManager):
    """A typo in a rate turns 5 EUR into a fortune."""

    group = await make_group(manager, currency="EUR")
    admin = await admin_of(manager, group.id)

    with pytest.raises(InvalidExchangeRateError):
        await manager.create_expense(
            group_id=group.id,
            title="Diner",
            amount=10_000,
            currency="USD",
            paid_by_member_id=admin.id,
            expense_date=NOW,
            exchange_rate=0,
        )

async def test_a_debt_is_written_down_and_owed(manager: SharedExpensesManager):
    """"Michel owes 46,25 to Dupont", said with what the model already had.

    A debt and a reimbursement are the same movement of money: `from` is
    whoever is out of pocket. On a debt that is the lender, so Dupont is `from`
    and Michel ends up owing him.
    """

    group = await make_group(manager, admin_name="Dupont")
    michel = await manager.create_group_member(group_id=group.id, name="Michel")
    dupont = next(
        m for m in await manager.list_group_members(group.id) if m.name == "Dupont"
    )

    payment = await manager.create_payment(
        group_id=group.id,
        from_member_id=dupont.id,
        to_member_id=michel.id,
        amount=4625,
        payment_date=NOW,
        kind=PaymentKind.DEBT,
    )

    assert payment.kind is PaymentKind.DEBT

    result = await manager.get_balances(group.id)

    assert result.balances == {dupont.id: 4625, michel.id: -4625}

    # And the way out of it is the reimbursement it suggests.
    transfers = [
        (s.from_member_id, s.to_member_id, s.amount) for s in result.settlements
    ]

    assert transfers == [(michel.id, dupont.id, 4625)]


async def test_a_debt_weighs_the_same_as_a_reimbursement(
    manager: SharedExpensesManager,
):
    """The kind is read, never reckoned with.

    Both are one movement of money; only the words differ. A balance that
    treated them apart would be counting the label instead of the cash.
    """

    group = await make_group(manager, admin_name="Dupont")
    michel = await manager.create_group_member(group_id=group.id, name="Michel")
    dupont = next(
        m for m in await manager.list_group_members(group.id) if m.name == "Dupont"
    )

    await manager.create_payment(
        group_id=group.id,
        from_member_id=dupont.id,
        to_member_id=michel.id,
        amount=4625,
        payment_date=NOW,
        kind=PaymentKind.DEBT,
    )

    # Michel pays it back. Same two people, the other way round.
    await manager.create_payment(
        group_id=group.id,
        from_member_id=michel.id,
        to_member_id=dupont.id,
        amount=4625,
        payment_date=NOW,
    )

    result = await manager.get_balances(group.id)

    assert result.balances == {dupont.id: 0, michel.id: 0}
    assert result.settlements == []


async def test_a_payment_is_a_reimbursement_unless_told_otherwise(
    manager: SharedExpensesManager,
):
    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    payment = await manager.create_payment(
        group_id=group.id,
        from_member_id=antonin.id,
        to_member_id=admin.id,
        amount=1000,
        payment_date=NOW,
    )

    assert payment.kind is PaymentKind.REIMBURSEMENT


async def test_shares_are_given_in_what_was_paid(manager: SharedExpensesManager):
    """Exactly what the expense dialog posts, and it used to be refused.

    The dialog resolves the split on the amount as typed and sends the figures
    it showed, so a 100 USD dinner split in two arrives as 50 and 50 -- dollars,
    the currency of the field the editor sits under. They were checked against
    the converted total, 87,68, which 100 has no way of adding up to: every
    expense in another currency was rejected out of hand.
    """

    group = await make_group(manager, currency="EUR")
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Diner a New York",
        amount=10_000,
        currency="USD",
        paid_by_member_id=admin.id,
        expense_date=NOW,
        exchange_rate=876_810,
        shares=[share_input(admin.id, 5_000), share_input(antonin.id, 5_000)],
    )

    # Halves of the dollars, stored as halves of the euros they came to.
    shares = await shares_of(manager, expense.id)

    assert shares == {admin.id: 4_384, antonin.id: 4_384}
    assert sum(shares.values()) == expense.converted_amount


async def test_an_exact_share_is_in_what_was_paid(manager: SharedExpensesManager):
    """"Antonin owes 20" on a New York dinner is twenty dollars.

    The editor sits under a field reading USD, so that is what its figures mean.
    Twenty of those dollars is 17,54 to a group counting in euros.
    """

    group = await make_group(manager, currency="EUR")
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Diner a New York",
        amount=10_000,
        currency="USD",
        paid_by_member_id=admin.id,
        expense_date=NOW,
        exchange_rate=876_810,
        split_rule=SplitRule(
            envelope=0,
            remainder=Remainder(
                fixed={antonin.id: 2_000},
                members=(antonin.id, admin.id),
            ),
        ),
    )

    shares = await shares_of(manager, expense.id)

    assert shares[antonin.id] == 1_754
    assert sum(shares.values()) == expense.converted_amount == 8_768

    # And the rule reads back in the currency it was typed in, beside the
    # amount it was typed against.
    assert expense.split_rule.remainder.fixed[antonin.id] == 2_000


async def test_editing_a_foreign_expense_reapportions_its_shares(
    manager: SharedExpensesManager,
):
    """The other half of the trip: the update path converts the same way.

    The dialog reopens on the dollars it stored, so it sends dollars back.
    """

    group = await make_group(manager, currency="EUR")
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Diner a New York",
        amount=10_000,
        currency="USD",
        paid_by_member_id=admin.id,
        expense_date=NOW,
        exchange_rate=876_810,
    )

    # The bill was 200 dollars, not 100, and it is still split down the middle.
    await manager.update_expense(
        replace(expense, amount=20_000),
        shares=[share_input(admin.id, 10_000), share_input(antonin.id, 10_000)],
    )

    reloaded = await manager.get_expense(expense.id)
    shares = await shares_of(manager, expense.id)

    assert reloaded.converted_amount == 17_536
    assert sum(shares.values()) == 17_536
    assert shares == {admin.id: 8_768, antonin.id: 8_768}


async def test_a_second_group_can_be_created_from_the_same_account(
    manager: SharedExpensesManager,
):
    """The same person cannot be two people.

    A member is one per Home Assistant account and the database enforces it, so
    minting a fresh one for every group made the second group impossible to
    create -- for anybody logged in, which is everybody. Every test here missed
    it by leaving `admin_user_id` unset: a null user_id is distinct from every
    other null, so the index never fired.
    """

    first = await manager.create_group(
        group_name="Appartement",
        admin_name="Stephane",
        admin_user_id="ha-user-1",
    )
    second = await manager.create_group(
        group_name="Vacances",
        admin_name="Stephane",
        admin_user_id="ha-user-1",
    )

    admin_of_first = (await manager.list_group_members(first.id))[0]
    admin_of_second = (await manager.list_group_members(second.id))[0]

    # One member, owning both. Not two members who happen to share a name.
    assert admin_of_first.id == admin_of_second.id
    assert admin_of_first.user_id == "ha-user-1"

    memberships = await manager.list_group_memberships(second.id)

    assert memberships[0].role is GroupRole.ADMIN


async def test_a_group_can_be_created_after_one_was_deleted(
    manager: SharedExpensesManager,
):
    """Exactly what Stephane did, and it answered "an error occurred".

    Deleting a group takes its memberships with it and leaves the member: they
    are global, and an account keeps its identity across the groups it comes and
    goes from. The next group then tried to mint that same account a second one.
    """

    first = await manager.create_group(
        group_name="Appartement",
        admin_name="Stephane",
        admin_user_id="ha-user-1",
    )

    await manager.delete_group(first.id)

    second = await manager.create_group(
        group_name="Coloc",
        admin_name="Stephane",
        admin_user_id="ha-user-1",
    )

    members = await manager.list_group_members(second.id)

    assert [member.name for member in members] == ["Stephane"]
    assert members[0].user_id == "ha-user-1"


async def test_an_admin_keeps_the_name_they_already_go_by(
    manager: SharedExpensesManager,
):
    """A new group does not get to rename someone.

    The account's name comes from Home Assistant and may well differ from what
    the household calls them; the member was named once and that name is theirs.
    """

    await manager.create_group(
        group_name="Appartement",
        admin_name="Stephane",
        admin_user_id="ha-user-1",
    )

    second = await manager.create_group(
        group_name="Vacances",
        admin_name="Stephane Fath",
        admin_user_id="ha-user-1",
    )

    members = await manager.list_group_members(second.id)

    assert [member.name for member in members] == ["Stephane"]


async def test_a_payment_in_another_currency_clears_what_it_is_worth(
    manager: SharedExpensesManager,
):
    """100 USD handed back does not clear 100 EUR owed.

    The whole point of converting a payment at all. Before, `amount` went
    straight into the balances, so paying somebody back in dollars cleared their
    euros one for one and both walked away thinking they were square.
    """

    group = await make_group(manager, currency="EUR")
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    # Antonin owes 43,84 after a 87,68 dinner split in two.
    await manager.create_expense(
        group_id=group.id,
        title="Diner",
        amount=8_768,
        paid_by_member_id=admin.id,
        expense_date=NOW,
    )

    payment = await manager.create_payment(
        group_id=group.id,
        from_member_id=antonin.id,
        to_member_id=admin.id,
        amount=5_000,
        currency="USD",
        exchange_rate=876_810,
        payment_date=NOW,
    )

    # 50 USD is 43,84 EUR, which is exactly what he owed.
    assert payment.amount == 5_000
    assert payment.currency == "USD"
    assert payment.converted_amount == 4_384

    balances = await manager.get_balances(group.id)

    assert balances.balances[antonin.id] == 0
    assert balances.balances[admin.id] == 0
    assert balances.settlements == []


async def test_the_rate_of_a_payment_is_frozen(manager: SharedExpensesManager):
    """Re-saving a payment must not re-price it at today's rate."""

    group = await make_group(manager, currency="EUR")
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    payment = await manager.create_payment(
        group_id=group.id,
        from_member_id=antonin.id,
        to_member_id=admin.id,
        amount=5_000,
        currency="USD",
        exchange_rate=876_810,
        payment_date=NOW,
    )

    await manager.update_payment(replace(payment, description="Rembourse"))

    reloaded = await manager.get_payment(payment.id)

    assert reloaded.exchange_rate == 876_810
    assert reloaded.converted_amount == 4_384
