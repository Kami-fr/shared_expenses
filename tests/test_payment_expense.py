"""Tests for a payment that names the expense it is about.

The link moves nothing. Balances are the sum of what changed hands, and saying
what a handover was for changes no figure anywhere — which is exactly why it
needs guarding rather than trusting: nothing else in the suite would go red if
it silently stopped being stored.

Two ways it can vanish without a sound, and both have happened here before. A
field left out of `payment_state` makes `update_payment` decide nothing moved
and skip the write, telling the caller it went fine — that is how `kind` was
once unsaveable. And a link is a column that was added once already, in v14,
read by nothing, and dropped again in v15; what stops that repeating is a test
that reads it back.
"""

from __future__ import annotations

from dataclasses import replace
from datetime import UTC, datetime

import pytest

from custom_components.shared_expenses.exceptions import (
    ExpenseNotFoundError,
    InvalidPaymentError,
)
from custom_components.shared_expenses.manager import SharedExpensesManager
from custom_components.shared_expenses.models import PaymentKind

NOW = datetime(2026, 8, 2, 12, 0, tzinfo=UTC)


async def a_group(manager: SharedExpensesManager):
    """Return a group, its two members, and a 40,00 expense one of them paid."""

    group = await manager.create_group(group_name="Appartement", admin_name="Stephane")

    stephane = (await manager.list_group_members(group.id))[0]
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")

    expense = await manager.create_expense(
        group_id=group.id,
        title="Courses",
        amount=4_000,
        paid_by_member_id=stephane.id,
        expense_date=NOW,
        shares=None,
    )

    return group, stephane, antonin, expense


async def a_payment(
    manager: SharedExpensesManager,
    group_id: str,
    frm: str,
    to: str,
    **extra,
):
    """Record 20,00 handed from one member to another."""

    return await manager.create_payment(
        group_id=group_id,
        from_member_id=frm,
        to_member_id=to,
        amount=2_000,
        payment_date=NOW,
        **extra,
    )


async def test_a_payment_can_name_the_expense_it_is_about(
    manager: SharedExpensesManager,
):
    """The whole of the feature: it is stored, and it is read back."""

    group, stephane, antonin, expense = await a_group(manager)

    payment = await a_payment(
        manager,
        group.id,
        antonin.id,
        stephane.id,
        expense_id=expense.id,
    )

    assert payment.expense_id == expense.id

    # From the database and not from what create returned, which is the half
    # that v14 never had: a column written and never read again.
    stored = await manager.get_payment(payment.id)

    assert stored.expense_id == expense.id


async def test_a_payment_needs_name_no_expense(manager: SharedExpensesManager):
    """Money handed over at the end of a month answers no single expense."""

    group, stephane, antonin, _ = await a_group(manager)

    payment = await a_payment(manager, group.id, antonin.id, stephane.id)

    assert payment.expense_id is None


async def test_a_debt_can_name_one_too(manager: SharedExpensesManager):
    """Both kinds are the same movement of money with different words on it."""

    group, stephane, antonin, expense = await a_group(manager)

    payment = await a_payment(
        manager,
        group.id,
        stephane.id,
        antonin.id,
        kind=PaymentKind.DEBT,
        expense_id=expense.id,
    )

    assert (await manager.get_payment(payment.id)).expense_id == expense.id


async def test_an_expense_of_another_project_is_refused(
    manager: SharedExpensesManager,
):
    """An id is enough to ask with, so the answer must not come back."""

    group, stephane, antonin, _ = await a_group(manager)

    other = await manager.create_group(group_name="Vacances", admin_name="Stephane")
    theirs = (await manager.list_group_members(other.id))[0]

    elsewhere = await manager.create_expense(
        group_id=other.id,
        title="Hotel",
        amount=9_000,
        paid_by_member_id=theirs.id,
        expense_date=NOW,
        shares=None,
    )

    with pytest.raises(InvalidPaymentError) as refusal:
        await a_payment(
            manager,
            group.id,
            antonin.id,
            stephane.id,
            expense_id=elsewhere.id,
        )

    assert refusal.value.code == "payment_expense_other_project"


async def test_an_expense_that_is_not_there_is_refused(
    manager: SharedExpensesManager,
):
    """Refused rather than quietly dropped.

    A link that does not appear reads as a save that did not take, and somebody
    would only try again.
    """

    group, stephane, antonin, _ = await a_group(manager)

    with pytest.raises(ExpenseNotFoundError):
        await a_payment(
            manager,
            group.id,
            antonin.id,
            stephane.id,
            expense_id="nothing-of-the-sort",
        )


async def test_the_link_can_be_put_on_and_taken_off_again(
    manager: SharedExpensesManager,
):
    """The one that `payment_state` decides.

    Naming an expense moves no money, so every other field of the payment is
    identical either side of this save. If `expense_id` is not in the state
    `update_payment` diffs, it finds no change, returns early, and reports
    success — the save is skipped and the caller is told it went fine. That is
    not hypothetical: it is exactly how `kind` was once unsaveable.
    """

    group, stephane, antonin, expense = await a_group(manager)

    payment = await a_payment(manager, group.id, antonin.id, stephane.id)

    await manager.update_payment(replace(payment, expense_id=expense.id))

    assert (await manager.get_payment(payment.id)).expense_id == expense.id

    await manager.update_payment(replace(payment, expense_id=None))

    assert (await manager.get_payment(payment.id)).expense_id is None


async def test_an_update_cannot_smuggle_in_another_project(
    manager: SharedExpensesManager,
):
    """An update carries the whole payment, so the door has two sides."""

    group, stephane, antonin, _ = await a_group(manager)

    other = await manager.create_group(group_name="Vacances", admin_name="Stephane")
    theirs = (await manager.list_group_members(other.id))[0]

    elsewhere = await manager.create_expense(
        group_id=other.id,
        title="Hotel",
        amount=9_000,
        paid_by_member_id=theirs.id,
        expense_date=NOW,
        shares=None,
    )

    payment = await a_payment(manager, group.id, antonin.id, stephane.id)

    with pytest.raises(InvalidPaymentError) as refusal:
        await manager.update_payment(replace(payment, expense_id=elsewhere.id))

    assert refusal.value.code == "payment_expense_other_project"


async def test_a_restored_payment_still_says_what_it_was_about(
    manager: SharedExpensesManager,
):
    """The deletion's snapshot is the only place it exists in between."""

    group, stephane, antonin, expense = await a_group(manager)

    payment = await a_payment(
        manager,
        group.id,
        antonin.id,
        stephane.id,
        expense_id=expense.id,
    )

    await manager.delete_payment(payment.id)

    restored = await manager.restore_payment(group.id, payment.id)

    assert restored.expense_id == expense.id


async def test_the_link_waits_while_the_expense_is_away(
    manager: SharedExpensesManager,
):
    """No foreign key, on purpose.

    A deleted expense really leaves its table and comes back under the same id,
    so a constraint would either cut every payment loose on the deletion or
    refuse the deletion outright. Held plainly, the link points at nothing while
    the expense is away — and reads again the day it returns.
    """

    group, stephane, antonin, expense = await a_group(manager)

    payment = await a_payment(
        manager,
        group.id,
        antonin.id,
        stephane.id,
        expense_id=expense.id,
    )

    await manager.delete_expense(expense.id)

    # Still saying what it always said, and pointing at something not there.
    assert (await manager.get_payment(payment.id)).expense_id == expense.id

    with pytest.raises(ExpenseNotFoundError):
        await manager.get_expense(expense.id)

    await manager.restore_expense(group.id, expense.id)

    assert (await manager.get_expense(expense.id)).id == expense.id
    assert (await manager.get_payment(payment.id)).expense_id == expense.id


async def test_the_link_is_in_the_history(manager: SharedExpensesManager):
    """Putting one on is a change somebody made, and the journal says so."""

    group, stephane, antonin, expense = await a_group(manager)

    payment = await a_payment(manager, group.id, antonin.id, stephane.id)

    await manager.update_payment(replace(payment, expense_id=expense.id))

    revisions = await manager.list_entity_revisions(group.id, payment.id)
    changed = {change.field: change.after for change in revisions[0].changes}

    assert changed == {"expense_id": expense.id}
