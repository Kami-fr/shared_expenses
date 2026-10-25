"""Tests for the expense that comes back: the rent, a subscription, the electricity.

A recurring expense is not money. Each occurrence is proposed and becomes an
expense only once somebody confirms it, so what is proved here is mostly about
answers: that the right occurrence is the one waiting, that two answers to the
same one add it once, that a skip moves on without adding anything, and that the
days fall where a calendar says they do — the 31st included, which is where a
rhythm walked one month at a time quietly settles on the 28th for good.
"""

from __future__ import annotations

from dataclasses import replace
from datetime import UTC, date, datetime

import pytest

from custom_components.shared_expenses import manager as manager_module
from custom_components.shared_expenses.const import EVENT_RECURRING_DUE
from custom_components.shared_expenses.exceptions import (
    InvalidExpenseSharesError,
    InvalidRecurringError,
    InvalidSplitRuleError,
)
from custom_components.shared_expenses.helpers.currency import RATE_ONE
from custom_components.shared_expenses.manager import SharedExpensesManager
from custom_components.shared_expenses.models import (
    ExpenseShare,
    RecurrenceUnit,
    RecurringExpense,
    RevisionAction,
    RevisionEntity,
    SplitRule,
)
from custom_components.shared_expenses.websocket.serializers import (
    recurring_to_dict,
)

MONTH = RecurrenceUnit.MONTH
WEEK = RecurrenceUnit.WEEK
DAY = RecurrenceUnit.DAY


def noon(day: date) -> datetime:
    """Return the panel's own time for a day: noon, UTC."""

    return datetime(day.year, day.month, day.day, 12, tzinfo=UTC)


def rhythm(anchor: date, every: int, unit: RecurrenceUnit) -> RecurringExpense:
    """Return a recurring expense with only a rhythm, for the calendar tests."""

    return RecurringExpense(
        id="r",
        group_id="g",
        category_id=None,
        title="Rent",
        description=None,
        amount=100,
        currency="EUR",
        paid_by_member_id="m",
        every=every,
        unit=unit,
        anchor=anchor,
        next_index=0,
        created_at=noon(anchor),
    )


async def a_flat(manager: SharedExpensesManager):
    """Return a group and its two members."""

    group = await manager.create_group(group_name="Appartement", admin_name="Stephane")
    stephane = (await manager.list_group_members(group.id))[0]
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")

    return group, stephane, antonin


async def rent(manager: SharedExpensesManager, group, payer, **kwargs):
    """Set up a monthly rent of 1 200,00 from the 1st of August, paid by `payer`."""

    return await manager.create_recurring(
        group_id=group.id,
        title="Loyer",
        amount=120_000,
        paid_by_member_id=payer.id,
        expense_date=noon(kwargs.pop("first", date(2026, 8, 1))),
        every=kwargs.pop("every", 1),
        unit=kwargs.pop("unit", MONTH),
        **kwargs,
    )


async def confirm(manager: SharedExpensesManager, recurring, occurrence, **kwargs):
    """Confirm an occurrence the way the panel does: an expense naming it."""

    return await manager.create_expense(
        group_id=recurring.group_id,
        title=recurring.title,
        amount=kwargs.pop("amount", recurring.amount),
        paid_by_member_id=recurring.paid_by_member_id,
        expense_date=noon(occurrence),
        recurring_id=recurring.id,
        occurrence=occurrence,
        **kwargs,
    )


#
# The calendar
#


def test_the_31st_falls_on_the_last_day_of_shorter_months_and_comes_back():
    recurring = rhythm(date(2026, 1, 31), 1, MONTH)

    assert [recurring.occurrence(k) for k in range(5)] == [
        date(2026, 1, 31),
        date(2026, 2, 28),
        date(2026, 3, 31),
        date(2026, 4, 30),
        date(2026, 5, 31),
    ]


def test_a_leap_year_has_its_29th():
    recurring = rhythm(date(2027, 12, 31), 2, MONTH)

    assert recurring.occurrence(1) == date(2028, 2, 29)


def test_every_two_months_crosses_the_year():
    recurring = rhythm(date(2026, 11, 15), 2, MONTH)

    assert [recurring.occurrence(k) for k in range(3)] == [
        date(2026, 11, 15),
        date(2027, 1, 15),
        date(2027, 3, 15),
    ]


def test_weeks_and_days_are_counted_in_days():
    assert rhythm(date(2026, 10, 23), 2, WEEK).occurrence(3) == date(2026, 12, 4)
    assert rhythm(date(2026, 10, 23), 10, DAY).occurrence(1) == date(2026, 11, 2)


def test_what_is_waiting_is_counted_up_to_today_and_no_further():
    recurring = rhythm(date(2026, 8, 1), 1, MONTH)

    assert recurring.waiting(date(2026, 7, 31)) == 0
    assert recurring.waiting(date(2026, 10, 23)) == 3
    assert recurring.waiting(date(2026, 11, 1)) == 4


def test_the_last_occurrence_due_is_the_newest_not_the_one_waiting():
    recurring = rhythm(date(2026, 1, 31), 1, MONTH)

    assert recurring.last_due(date(2026, 1, 30)) is None
    assert recurring.last_due(date(2026, 3, 15)) == date(2026, 2, 28)
    assert recurring.last_due(date(2026, 3, 31)) == date(2026, 3, 31)
    assert rhythm(date(2026, 10, 2), 2, WEEK).last_due(date(2026, 10, 29)) == date(
        2026, 10, 16
    )

    ending = replace(recurring, ends_on=date(2026, 2, 28))

    assert ending.last_due(date(2027, 6, 1)) == date(2026, 2, 28)


#
# Setting one up
#


async def test_setting_one_up_adds_the_first_occurrence(manager: SharedExpensesManager):
    group, stephane, _ = await a_flat(manager)

    recurring, expense = await rent(manager, group, stephane)

    assert expense.recurring_id == recurring.id
    assert expense.expense_date.date() == date(2026, 8, 1)
    assert recurring.next_due == date(2026, 9, 1)

    journal = await manager.list_revisions(group.id)
    kinds = {(revision.entity_type, revision.action) for revision in journal}

    assert (RevisionEntity.RECURRING, RevisionAction.CREATED) in kinds
    assert (RevisionEntity.EXPENSE, RevisionAction.CREATED) in kinds


async def test_nothing_is_left_behind_when_the_first_occurrence_fails(
    manager: SharedExpensesManager,
):
    group, stephane, antonin = await a_flat(manager)

    # Refused inside the first expense, once the recurring expense is written:
    # the shares add up to half the rent.
    halves = [
        ExpenseShare(
            id="placeholder",
            expense_id="placeholder",
            member_id=member.id,
            amount=30_000,
            created_at=noon(date(2026, 8, 1)),
        )
        for member in (stephane, antonin)
    ]

    with pytest.raises(InvalidExpenseSharesError):
        await rent(manager, group, stephane, shares=halves)

    assert await manager.list_recurring(group.id) == []
    assert await manager.list_expenses(group.id) == []


@pytest.mark.parametrize(
    ("kwargs", "code"),
    [
        ({"every": 0}, "recurring_every"),
        ({"amount": -500}, "recurring_amount"),
        ({"ends_on": date(2026, 7, 1)}, "recurring_ends_before"),
    ],
)
async def test_a_rhythm_that_cannot_be_is_refused(
    manager: SharedExpensesManager,
    kwargs,
    code,
):
    group, stephane, _ = await a_flat(manager)

    amount = kwargs.pop("amount", 120_000)

    with pytest.raises(InvalidRecurringError) as caught:
        await manager.create_recurring(
            group_id=group.id,
            title="Loyer",
            amount=amount,
            paid_by_member_id=stephane.id,
            expense_date=noon(date(2026, 8, 1)),
            every=kwargs.pop("every", 1),
            unit=MONTH,
            **kwargs,
        )

    assert caught.value.code == code


#
# Answering an occurrence
#


async def test_confirming_the_waiting_occurrence_adds_it_and_moves_on(
    manager: SharedExpensesManager,
):
    group, stephane, _ = await a_flat(manager)
    recurring, _ = await rent(manager, group, stephane)

    expense = await confirm(manager, recurring, date(2026, 9, 1), amount=118_000)

    assert expense.recurring_id == recurring.id
    assert expense.amount == 118_000
    assert (await manager.get_recurring(recurring.id)).next_due == date(2026, 10, 1)

    latest = await manager.latest_occurrences(group.id)
    assert latest[recurring.id].id == expense.id


async def test_the_same_occurrence_confirmed_twice_is_added_once(
    manager: SharedExpensesManager,
):
    """Two phones, one rent: the second press is told somebody was quicker."""

    group, stephane, _ = await a_flat(manager)
    recurring, _ = await rent(manager, group, stephane)

    await confirm(manager, recurring, date(2026, 9, 1))

    with pytest.raises(InvalidRecurringError) as caught:
        await confirm(manager, recurring, date(2026, 9, 1))

    assert caught.value.code == "occurrence_answered"
    assert len(await manager.list_expenses(group.id)) == 2


async def test_an_occurrence_other_than_the_waiting_one_is_refused(
    manager: SharedExpensesManager,
):
    group, stephane, _ = await a_flat(manager)
    recurring, _ = await rent(manager, group, stephane)

    with pytest.raises(InvalidRecurringError):
        await confirm(manager, recurring, date(2026, 10, 1))

    assert len(await manager.list_expenses(group.id)) == 1


async def test_skipping_adds_nothing_and_says_so(manager: SharedExpensesManager):
    group, stephane, _ = await a_flat(manager)
    recurring, _ = await rent(manager, group, stephane)

    skipped = await manager.skip_occurrence(recurring.id, date(2026, 9, 1))

    assert skipped.next_due == date(2026, 10, 1)
    assert len(await manager.list_expenses(group.id)) == 1

    revision = (await manager.list_revisions(group.id))[0]

    assert revision.action == RevisionAction.SKIPPED
    assert [(c.field, c.before, c.after) for c in revision.changes] == [
        ("next_due", "2026-09-01", "2026-10-01")
    ]

    with pytest.raises(InvalidRecurringError):
        await manager.skip_occurrence(recurring.id, date(2026, 9, 1))


async def test_missed_occurrences_wait_at_their_own_dates(
    manager: SharedExpensesManager,
):
    """Home Assistant off since August: September and October are both there."""

    group, stephane, _ = await a_flat(manager)
    recurring, _ = await rent(manager, group, stephane)
    today = date(2026, 10, 23)

    assert recurring.waiting(today) == 2

    first = await confirm(manager, recurring, date(2026, 9, 1))
    second = await confirm(manager, recurring, date(2026, 10, 1))

    assert first.expense_date.date() == date(2026, 9, 1)
    assert second.expense_date.date() == date(2026, 10, 1)
    assert not (await manager.get_recurring(recurring.id)).due_on(today)


async def test_nothing_waits_after_the_last_day(manager: SharedExpensesManager):
    group, stephane, _ = await a_flat(manager)
    recurring, _ = await rent(manager, group, stephane, ends_on=date(2026, 9, 15))

    await confirm(manager, recurring, date(2026, 9, 1))

    ended = await manager.get_recurring(recurring.id)

    assert ended.ended
    assert not ended.due_on(date(2027, 1, 1))

    with pytest.raises(InvalidRecurringError):
        await confirm(manager, ended, date(2026, 10, 1))


async def test_a_category_rule_is_read_when_an_occurrence_is_confirmed(
    manager: SharedExpensesManager,
):
    """No rule of its own: the category's, as it stands on the day."""

    group, stephane, antonin = await a_flat(manager)
    recurring, _ = await rent(manager, group, stephane)

    expense = await confirm(manager, recurring, date(2026, 9, 1))
    shares = {
        s.member_id: s.amount for s in await manager.get_expense_shares(expense.id)
    }

    assert shares == {stephane.id: 60_000, antonin.id: 60_000}


async def test_an_occurrence_split_by_nothing_keeps_the_equal_split(
    manager: SharedExpensesManager,
):
    """No rule anywhere: kept as an equal split, not as the cents it came to.

    Added in one tap and reopened to correct the bill, it was spelled back out as
    two fixed amounts that no longer added up to the new figure, and refused.
    Shares sent already worked out still keep no rule: theirs is not known.
    """

    group, stephane, antonin = await a_flat(manager)
    recurring, _ = await rent(manager, group, stephane)

    expense = await confirm(manager, recurring, date(2026, 9, 1))
    rule = expense.split_rule

    assert rule is not None
    assert rule.envelope is None
    assert set(rule.participants) == {stephane.id, antonin.id}
    assert rule.remainder.fixed == {}
    assert rule.remainder.percent == {}

    sent = await confirm(
        manager,
        await manager.get_recurring(recurring.id),
        date(2026, 10, 1),
        shares=[
            ExpenseShare(
                id="placeholder",
                expense_id="placeholder",
                member_id=member.id,
                amount=amount,
                created_at=noon(date(2026, 10, 1)),
            )
            for member, amount in ((stephane, 20_000), (antonin, 100_000))
        ],
    )

    assert sent.split_rule is None


#
# Changing it
#


async def test_pausing_passes_over_what_fell_due_meanwhile(
    manager: SharedExpensesManager,
):
    group, stephane, _ = await a_flat(manager)
    recurring, _ = await rent(manager, group, stephane)

    paused = await manager.update_recurring(
        recurring.id,
        today=date(2026, 8, 15),
        changes={"paused": True},
    )

    assert not paused.due_on(date(2026, 12, 1))

    resumed = await manager.update_recurring(
        recurring.id,
        today=date(2026, 11, 20),
        changes={"paused": False},
    )

    assert resumed.next_due == date(2026, 12, 1)


async def test_a_new_rhythm_counts_from_the_occurrence_waiting(
    manager: SharedExpensesManager,
):
    group, stephane, _ = await a_flat(manager)
    recurring, _ = await rent(manager, group, stephane, first=date(2026, 8, 31))

    changed = await manager.update_recurring(
        recurring.id,
        today=date(2026, 9, 1),
        changes={"every": 2},
    )

    assert changed.next_due == date(2026, 9, 30)
    assert changed.occurrence(changed.next_index + 1) == date(2026, 11, 30)


async def test_a_payer_no_occurrence_could_be_added_with_is_refused(
    manager: SharedExpensesManager,
):
    group, stephane, antonin = await a_flat(manager)
    recurring, _ = await rent(manager, group, stephane)

    elsewhere = await manager.create_group(group_name="Ailleurs", admin_name="Marcus")
    stranger = (await manager.list_group_members(elsewhere.id))[0]

    with pytest.raises(InvalidSplitRuleError) as refused:
        await manager.update_recurring(
            recurring.id,
            today=date(2026, 8, 2),
            changes={"paid_by_member_id": stranger.id},
        )

    assert refused.value.code == "split_payer_not_member"

    membership = next(
        m
        for m in await manager.list_group_memberships(group.id)
        if m.member_id == antonin.id
    )
    await manager.remove_member_from_group(membership)

    with pytest.raises(InvalidSplitRuleError):
        await manager.update_recurring(
            recurring.id,
            today=date(2026, 8, 2),
            changes={"paid_by_member_id": antonin.id},
        )

    with pytest.raises(InvalidSplitRuleError):
        await manager.update_recurring(
            recurring.id,
            today=date(2026, 8, 2),
            changes={"split_rule": SplitRule(participants=(stephane.id, antonin.id))},
        )

    # What is not being written is not held against it.
    paused = await manager.update_recurring(
        recurring.id,
        today=date(2026, 8, 2),
        changes={"paused": True},
    )

    assert paused.paused


async def test_the_next_date_can_be_moved(manager: SharedExpensesManager):
    group, stephane, _ = await a_flat(manager)
    recurring, _ = await rent(manager, group, stephane)

    moved = await manager.update_recurring(
        recurring.id,
        today=date(2026, 8, 2),
        changes={"next_due": date(2026, 9, 5)},
    )

    assert moved.next_due == date(2026, 9, 5)
    assert moved.occurrence(moved.next_index + 1) == date(2026, 10, 5)

    revision = (await manager.list_revisions(group.id))[0]

    assert revision.action == RevisionAction.UPDATED
    assert {c.field for c in revision.changes} == {"next_due"}


async def test_a_raised_amount_is_proposed_rather_than_last_times(
    manager: SharedExpensesManager,
):
    group, stephane, _ = await a_flat(manager)
    recurring, _ = await rent(manager, group, stephane)

    assert recurring.id in await manager.latest_occurrences(group.id)

    raised = await manager.update_recurring(
        recurring.id,
        today=date(2026, 8, 2),
        changes={"amount": 125_000},
    )

    assert recurring.id not in await manager.latest_occurrences(group.id)

    # Retitling says nothing of the figure.
    await manager.update_recurring(
        recurring.id,
        today=date(2026, 8, 2),
        changes={"title": "Loyer T3"},
    )

    assert recurring.id not in await manager.latest_occurrences(group.id)

    september = await confirm(manager, raised, date(2026, 9, 1), amount=125_500)

    latest = await manager.latest_occurrences(group.id)

    assert latest[recurring.id].id == september.id


async def test_stopping_keeps_what_was_added(manager: SharedExpensesManager):
    group, stephane, _ = await a_flat(manager)
    recurring, expense = await rent(manager, group, stephane)

    await manager.delete_recurring(recurring.id)

    assert await manager.list_recurring(group.id) == []
    assert (await manager.get_expense(expense.id)).recurring_id == recurring.id


async def test_a_deleted_occurrence_comes_back_still_saying_where_from(
    manager: SharedExpensesManager,
):
    group, stephane, _ = await a_flat(manager)
    recurring, expense = await rent(manager, group, stephane)

    await manager.delete_expense(expense.id)
    restored = await manager.restore_expense(group.id, expense.id)

    assert restored.recurring_id == recurring.id


#
# Telling the house
#


async def test_an_occurrence_is_announced_once(hass, manager: SharedExpensesManager):
    group, stephane, _ = await a_flat(manager)
    recurring, _ = await rent(manager, group, stephane)

    def fired():
        return [data for kind, data in hass.bus.events if kind == EVENT_RECURRING_DUE]

    await manager.announce_due(date(2026, 8, 20))
    assert fired() == []

    await manager.announce_due(date(2026, 10, 23))
    await manager.announce_due(date(2026, 10, 24))

    assert len(fired()) == 1
    assert fired()[0]["recurring_id"] == recurring.id
    assert fired()[0]["due"] == "2026-09-01"
    assert fired()[0]["waiting"] == 2

    # Both caught up: the next one is news again when its day comes.
    await confirm(manager, recurring, date(2026, 9, 1))
    await confirm(manager, recurring, date(2026, 10, 1))
    await manager.announce_due(date(2026, 11, 1))

    assert [data["due"] for data in fired()] == ["2026-09-01", "2026-11-01"]


async def test_a_new_occurrence_is_announced_while_an_older_one_waits(
    hass, manager: SharedExpensesManager
):
    group, stephane, _ = await a_flat(manager)
    await rent(manager, group, stephane)

    def fired():
        return [data for kind, data in hass.bus.events if kind == EVENT_RECURRING_DUE]

    await manager.announce_due(date(2026, 9, 1))
    await manager.announce_due(date(2026, 9, 20))
    await manager.announce_due(date(2026, 10, 1))

    assert [(data["due"], data["waiting"]) for data in fired()] == [
        ("2026-09-01", 1),
        ("2026-09-01", 2),
    ]


async def test_an_archived_group_is_not_announced(hass, manager: SharedExpensesManager):
    group, stephane, _ = await a_flat(manager)
    await rent(manager, group, stephane)

    await manager.archive_group(group.id)
    await manager.announce_due(date(2026, 10, 23))

    assert [kind for kind, _ in hass.bus.events if kind == EVENT_RECURRING_DUE] == []


#
# What is read back
#


async def test_each_recurring_expense_reads_back_its_own_latest(
    manager: SharedExpensesManager,
):
    group, stephane, antonin = await a_flat(manager)
    loyer, _ = await rent(manager, group, stephane)
    internet, _ = await rent(manager, group, antonin, first=date(2026, 8, 10))

    september = await confirm(manager, loyer, date(2026, 9, 1), amount=121_000)
    await confirm(manager, internet, date(2026, 9, 10), amount=3_000)
    october = await confirm(manager, internet, date(2026, 10, 10), amount=3_100)

    latest = await manager.latest_occurrences(group.id)

    assert {key: value.id for key, value in latest.items()} == {
        loyer.id: september.id,
        internet.id: october.id,
    }


async def test_last_time_in_another_currency_is_not_proposed(
    manager: SharedExpensesManager,
):
    group, stephane, _ = await a_flat(manager)
    recurring, _ = await rent(manager, group, stephane)

    await confirm(
        manager,
        recurring,
        date(2026, 9, 1),
        amount=140_000,
        currency="USD",
        exchange_rate=RATE_ONE * 9 // 10,
    )

    latest = (await manager.latest_occurrences(group.id))[recurring.id]
    told = recurring_to_dict(recurring, date(2026, 9, 2), latest)

    assert told["latest_amount"] is None
    assert told["latest_date"] is None


async def test_the_first_rate_is_fetched_before_the_transaction(
    manager: SharedExpensesManager, monkeypatch
):
    group, stephane, _ = await a_flat(manager)
    during: list[bool] = []

    async def fetch(session, base, quote, on):
        during.append(manager._database._owner is not None)
        return RATE_ONE * 9 // 10, on

    monkeypatch.setattr(manager_module, "fetch_rate", fetch)
    monkeypatch.setattr(manager, "_session", lambda: None)

    _, expense = await rent(manager, group, stephane, currency="USD")

    assert during == [False]
    assert expense.exchange_rate == RATE_ONE * 9 // 10

