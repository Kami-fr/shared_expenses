"""Tests for the statistics: what a group spent, cut three ways."""

from __future__ import annotations

from datetime import UTC, datetime

from custom_components.shared_expenses.helpers.statistics import compute_statistics
from custom_components.shared_expenses.manager import SharedExpensesManager
from custom_components.shared_expenses.models import Expense, ExpenseShare

NOW = datetime(2026, 7, 14, 12, 0, tzinfo=UTC)


def expense(
    expense_id: str,
    amount: int,
    *,
    payer: str = "m1",
    category: str | None = None,
    date: datetime = NOW,
    converted: int | None = None,
) -> Expense:
    """Build an expense.

    `converted` is what it cost the group, which is what the statistics count.
    It defaults to the amount, the expense then being in the group's own
    currency — the overwhelming case.
    """

    return Expense(
        id=expense_id,
        group_id="g1",
        category_id=category,
        title=expense_id,
        description=None,
        amount=amount,
        currency="EUR",
        paid_by_member_id=payer,
        expense_date=date,
        created_at=NOW,
        converted_amount=amount if converted is None else converted,
        split_rule=None,
    )


def share(expense_id: str, member_id: str, amount: int) -> ExpenseShare:
    return ExpenseShare(
        id=f"{expense_id}-{member_id}",
        expense_id=expense_id,
        member_id=member_id,
        amount=amount,
        created_at=NOW,
    )


#
# The pure computation
#


def test_nothing_spent_is_all_zeroes():
    result = compute_statistics(expenses=[], shares=[])

    assert result.total == 0
    assert result.by_category == ()
    assert result.by_month == ()
    assert result.by_member == ()
    assert result.years == ()


def test_categories_are_ranked_by_what_they_cost():
    """A breakdown is asked as a ranking: biggest first."""

    expenses = [
        expense("e1", 1000, category="c-food"),
        expense("e2", 5000, category="c-rent"),
        expense("e3", 2000, category="c-food"),
        expense("e4", 500),
    ]

    result = compute_statistics(expenses=expenses, shares=[])

    assert [(c.category_id, c.total) for c in result.by_category] == [
        ("c-rent", 5000),
        ("c-food", 3000),
        (None, 500),
    ]
    assert result.total == 8500


def test_months_come_out_chronological():
    """Unlike a ranking, a run of months is read as time."""

    expenses = [
        expense("e1", 1000, date=datetime(2026, 7, 1, tzinfo=UTC)),
        expense("e2", 2000, date=datetime(2026, 5, 1, tzinfo=UTC)),
        expense("e3", 3000, date=datetime(2026, 7, 20, tzinfo=UTC)),
    ]

    result = compute_statistics(expenses=expenses, shares=[])

    assert [(m.month, m.total) for m in result.by_month] == [
        ("2026-05", 2000),
        ("2026-07", 4000),
    ]


def test_a_member_who_paid_and_a_member_who_only_consumed():
    """Paid and share are two different questions; both get an answer."""

    expenses = [expense("e1", 9000, payer="m1")]
    shares = [share("e1", "m1", 4500), share("e1", "m2", 4500)]

    result = compute_statistics(expenses=expenses, shares=shares)

    assert [(m.member_id, m.paid, m.share) for m in result.by_member] == [
        ("m1", 9000, 4500),
        ("m2", 0, 4500),
    ]


def test_a_year_cuts_on_the_date_you_typed():
    """A shop backdated to December belongs to December."""

    expenses = [
        expense("e1", 1000, date=datetime(2025, 12, 24, tzinfo=UTC)),
        expense("e2", 2000, date=datetime(2026, 7, 1, tzinfo=UTC)),
    ]
    shares = [share("e1", "m1", 1000), share("e2", "m1", 2000)]

    result = compute_statistics(expenses=expenses, shares=shares, year=2025)

    assert result.total == 1000
    assert [m.month for m in result.by_month] == ["2025-12"]
    assert [(m.member_id, m.share) for m in result.by_member] == [("m1", 1000)]

    # The picker must still offer every year, whichever one is being shown.
    assert result.years == (2026, 2025)


def test_shares_of_another_period_are_not_counted():
    """Every share of the group arrives at once: only the period's may count."""

    expenses = [
        expense("e1", 1000, date=datetime(2025, 12, 24, tzinfo=UTC)),
        expense("e2", 8000, date=datetime(2026, 7, 1, tzinfo=UTC)),
    ]
    shares = [share("e1", "m1", 1000), share("e2", "m1", 8000)]

    result = compute_statistics(expenses=expenses, shares=shares, year=2025)

    assert [(m.member_id, m.paid, m.share) for m in result.by_member] == [
        ("m1", 1000, 1000)
    ]


def test_a_share_of_nothing_is_not_a_member_of_the_breakdown():
    """Someone left out of an expense must not appear owing zero of it."""

    expenses = [expense("e1", 1000, payer="m1")]
    shares = [share("e1", "m1", 1000), share("e1", "m2", 0)]

    result = compute_statistics(expenses=expenses, shares=shares)

    assert [m.member_id for m in result.by_member] == ["m1"]


def test_the_group_currency_is_what_counts_not_the_till():
    """A total mixing 100 USD with 100 EUR is not a total of anything.

    Found by a test: the balances counted `amount` while the shares were
    converted, so both members came out owed 6,16 and the balances summed to
    12,32 instead of zero. Nothing crashed — the figures were simply wrong.
    """

    expenses = [
        # 100 USD, worth 87,68 EUR on the day.
        expense("e1", 10_000, converted=8_768),
        expense("e2", 10_000),
    ]

    result = compute_statistics(expenses=expenses, shares=[])

    assert result.total == 18_768
    assert [(m.member_id, m.paid) for m in result.by_member] == [("m1", 18_768)]


#
# Against a real database
#


async def make_group(manager: SharedExpensesManager, **kwargs):
    return await manager.create_group(
        group_name=kwargs.pop("group_name", "Appartement"),
        owner_name=kwargs.pop("owner_name", "Stephane"),
        **kwargs,
    )


async def test_statistics_end_to_end(manager: SharedExpensesManager):
    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    members = await manager.list_group_members(group.id)
    owner = next(m for m in members if m.name == "Stephane")

    food = await manager.create_category(group_id=group.id, name="Courses")

    await manager.create_expense(
        group_id=group.id,
        title="Courses",
        amount=9000,
        paid_by_member_id=owner.id,
        expense_date=NOW,
        category_id=food.id,
    )
    await manager.create_expense(
        group_id=group.id,
        title="Essence",
        amount=4000,
        paid_by_member_id=antonin.id,
        expense_date=NOW,
    )

    result = await manager.get_statistics(group.id)

    assert result.total == 13000
    assert [(c.category_id, c.total) for c in result.by_category] == [
        (food.id, 9000),
        (None, 4000),
    ]

    # Equal splits: each bore half of both, and the sum of the shares is the
    # total. A breakdown that does not add up to the total is a wrong one.
    assert sum(m.share for m in result.by_member) == result.total
    assert sum(m.paid for m in result.by_member) == result.total


async def test_a_reimbursement_is_not_spending(manager: SharedExpensesManager):
    """Counting it would say the household spent 100 on a 90 shop."""

    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    members = await manager.list_group_members(group.id)
    owner = next(m for m in members if m.name == "Stephane")

    await manager.create_expense(
        group_id=group.id,
        title="Courses",
        amount=9000,
        paid_by_member_id=owner.id,
        expense_date=NOW,
    )

    before = await manager.get_statistics(group.id)

    await manager.create_payment(
        group_id=group.id,
        from_member_id=antonin.id,
        to_member_id=owner.id,
        amount=4500,
        payment_date=NOW,
    )

    after = await manager.get_statistics(group.id)

    assert after.total == before.total == 9000
    assert [(m.member_id, m.paid) for m in after.by_member] == [
        (m.member_id, m.paid) for m in before.by_member
    ]


async def test_the_statistics_of_another_group_never_leak(
    manager: SharedExpensesManager,
):
    mine = await make_group(manager, group_name="Appartement")
    theirs = await make_group(manager, group_name="Ski")
    owner = (await manager.list_group_members(theirs.id))[0]

    await manager.create_expense(
        group_id=theirs.id,
        title="Forfait",
        amount=4000,
        paid_by_member_id=owner.id,
        expense_date=NOW,
    )

    assert (await manager.get_statistics(mine.id)).total == 0
    assert (await manager.get_statistics(theirs.id)).total == 4000
