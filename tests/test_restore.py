"""Tests for bringing back what was deleted.

A deletion is the only place a deleted expense still exists, and a restore is
built from it. So the thing worth proving is not that something reappears — it
is that what reappears is the *same* expense: the same id, the same day, the
same shares, and above all the same frozen rate. Converting afresh would restore
a different debt from the one that was deleted, and nothing would say so.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

import pytest

from custom_components.shared_expenses.helpers.currency import RATE_ONE
from custom_components.shared_expenses.manager import SharedExpensesManager
from custom_components.shared_expenses.models import (
    PaymentKind,
    Permission,
    RevisionAction,
    SplitRule,
)
from custom_components.shared_expenses.websocket import expenses, payments
from tests.conftest import ADMIN, PLAIN, FakeConnection, FakeHass, close_project, send

NOW = datetime(2026, 7, 14, 12, 0, tzinfo=UTC)


async def an_expense(
    manager: SharedExpensesManager,
    home: dict[str, Any],
    **kwargs: Any,
) -> Any:
    """Return an expense paid by the admin, entered by the admin."""

    return await manager.create_expense(
        group_id=home["group"].id,
        title=kwargs.pop("title", "Courses"),
        amount=kwargs.pop("amount", 8542),
        paid_by_member_id=kwargs.pop("paid_by_member_id", home["admin"].id),
        expense_date=kwargs.pop("expense_date", NOW),
        actor_user_id=kwargs.pop("actor_user_id", ADMIN),
        **kwargs,
    )


#
# The same expense, not a copy of it
#


async def test_a_restored_expense_keeps_its_id(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """Which is what makes its history one line rather than two."""

    expense = await an_expense(manager, project)

    await manager.delete_expense(expense.id, actor_user_id=ADMIN)

    connection = FakeConnection(ADMIN)

    await send(
        loaded,
        connection,
        expenses.websocket_restore_expense,
        {"group_id": project["group"].id, "expense_id": expense.id},
    )

    assert connection.errors == {}

    back = await manager.get_expense(expense.id)

    assert back.id == expense.id


async def test_a_restored_expense_is_the_one_that_was_deleted(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """Every field it was deleted with, down to who typed it."""

    expense = await manager.create_expense(
        group_id=project["group"].id,
        title="Courses",
        amount=8542,
        paid_by_member_id=project["plain"].id,
        expense_date=NOW,
        description="Carrefour",
        # Typed by somebody who did not pay it: the pair worth keeping.
        actor_user_id=ADMIN,
    )

    before = await manager.get_expense(expense.id)
    shares_before = {
        share.member_id: share.amount
        for share in await manager.get_expense_shares(expense.id)
    }

    await manager.delete_expense(expense.id, actor_user_id=ADMIN)
    await manager.restore_expense(project["group"].id, expense.id, actor_user_id=ADMIN)

    after = await manager.get_expense(expense.id)
    shares_after = {
        share.member_id: share.amount
        for share in await manager.get_expense_shares(expense.id)
    }

    assert after.title == before.title
    assert after.description == before.description
    assert after.amount == before.amount
    assert after.currency == before.currency
    assert after.paid_by_member_id == before.paid_by_member_id
    assert after.expense_date == before.expense_date
    assert after.category_id == before.category_id
    assert after.created_by_member_id == before.created_by_member_id
    assert shares_after == shares_before


async def test_a_restored_refund_comes_back_a_refund(
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """The one field a lost sign would flip in silence, into an expense."""

    expense = await an_expense(manager, project, title="Retour", amount=-2000)

    await manager.delete_expense(expense.id, actor_user_id=ADMIN)
    await manager.restore_expense(project["group"].id, expense.id, actor_user_id=ADMIN)

    back = await manager.get_expense(expense.id)
    shares = await manager.get_expense_shares(expense.id)

    assert back.amount == -2000
    assert back.converted_amount == -2000
    assert sum(share.amount for share in shares) == -2000


async def test_a_restored_expense_keeps_the_rate_it_was_frozen_at(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """The whole reason the deletion carries a snapshot.

    Converting again would use whatever the rate is now, and quietly restore a
    different debt from the one that was deleted. So the rate is taken from the
    deletion, not worked out — proved by moving the stored rate afterwards and
    watching the restore ignore it.
    """

    await manager.set_exchange_rate(
        base="USD",
        quote="EUR",
        on=NOW.date(),
        rate=876_810,
    )

    expense = await an_expense(manager, project, amount=10_000, currency="USD")

    assert expense.exchange_rate == 876_810
    assert expense.converted_amount == 8_768

    await manager.delete_expense(expense.id, actor_user_id=ADMIN)

    # The market moves. The debt does not.
    await manager.set_exchange_rate(
        base="USD",
        quote="EUR",
        on=NOW.date(),
        rate=500_000,
    )

    await manager.restore_expense(project["group"].id, expense.id, actor_user_id=ADMIN)

    back = await manager.get_expense(expense.id)

    assert back.exchange_rate == 876_810, "the restore re-converted at today's rate"
    assert back.converted_amount == 8_768
    assert back.rate_as_of == expense.rate_as_of


async def test_a_restored_expense_keeps_its_rule(
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """So reopening it shows what was meant, not just the figures."""

    expense = await an_expense(
        manager,
        project,
        amount=8542,
        split_rule=SplitRule(envelope=500, participants=[project["plain"].id]),
    )

    await manager.delete_expense(expense.id, actor_user_id=ADMIN)
    await manager.restore_expense(project["group"].id, expense.id, actor_user_id=ADMIN)

    back = await manager.get_expense(expense.id)

    assert back.split_rule is not None
    assert back.split_rule.envelope == 500


async def test_the_balances_come_back_with_it(
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """The point of all of it: the money is where it was."""

    expense = await an_expense(manager, project, amount=10_000)

    before = (await manager.get_balances(project["group"].id)).balances

    await manager.delete_expense(expense.id, actor_user_id=ADMIN)

    emptied = (await manager.get_balances(project["group"].id)).balances
    assert emptied != before, "the deletion should have moved the balances"

    await manager.restore_expense(project["group"].id, expense.id, actor_user_id=ADMIN)

    assert (await manager.get_balances(project["group"].id)).balances == before


#
# What the history says
#


async def test_a_restore_is_recorded(
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """And reads as its own thing, not as a creation."""

    expense = await an_expense(manager, project)

    await manager.delete_expense(expense.id, actor_user_id=ADMIN)
    await manager.restore_expense(project["group"].id, expense.id, actor_user_id=PLAIN)

    history = await manager.list_entity_revisions(project["group"].id, expense.id)

    assert [revision.action for revision in history] == [
        RevisionAction.RESTORED,
        RevisionAction.DELETED,
        RevisionAction.CREATED,
    ]
    assert history[0].actor_user_id == PLAIN


async def test_the_deletion_keeps_what_the_history_never_shows(
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """The snapshot is data, not display.

    A deletion carries the rate and the rule so a restore can be faithful; the
    panel shows none of it, because a deletion takes every field and saying
    which is no news.
    """

    expense = await an_expense(manager, project)

    await manager.delete_expense(expense.id, actor_user_id=ADMIN)

    history = await manager.list_entity_revisions(project["group"].id, expense.id)
    frozen = {change.field for change in history[0].changes}

    assert {"exchange_rate", "converted_amount", "created_by_member_id"} <= frozen


#
# Nothing to bring back
#


async def test_restoring_something_never_deleted_says_it_does_not_exist(
    loaded: FakeHass,
    project: dict[str, Any],
):
    connection = FakeConnection(ADMIN)

    await send(
        loaded,
        connection,
        expenses.websocket_restore_expense,
        {"group_id": project["group"].id, "expense_id": "01NOPE"},
    )

    assert connection.errors[1][0] == "expense_not_found"


async def test_restoring_twice_is_not_a_failure(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """Bringing back what is already back.

    The state asked for is the state there is, so this is nobody's mistake.
    Nothing happened, so nothing is recorded a second time.
    """

    expense = await an_expense(manager, project)

    await manager.delete_expense(expense.id, actor_user_id=ADMIN)
    await manager.restore_expense(project["group"].id, expense.id, actor_user_id=ADMIN)
    await manager.restore_expense(project["group"].id, expense.id, actor_user_id=ADMIN)

    history = await manager.list_entity_revisions(project["group"].id, expense.id)
    restores = [r for r in history if r.action is RevisionAction.RESTORED]

    assert len(restores) == 1


async def test_a_deletion_in_another_group_is_out_of_reach(
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """The group is the door, and a revision of another one does not come through."""

    expense = await an_expense(manager, project)

    await manager.delete_expense(expense.id, actor_user_id=ADMIN)

    other = await manager.create_group(
        group_name="Ski",
        admin_name="Bruno",
        admin_user_id="ha-bruno",
    )

    with pytest.raises(Exception) as raised:
        await manager.restore_expense(other.id, expense.id, actor_user_id="ha-bruno")

    assert "ExpenseNotFound" in type(raised.value).__name__


#
# Who may
#


async def test_restoring_somebody_elses_expense_needs_the_permission(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """A restore is the largest edit there is."""

    await close_project(manager, project["group"].id)

    expense = await an_expense(manager, project)

    await manager.delete_expense(expense.id, actor_user_id=ADMIN)

    connection = FakeConnection(PLAIN)

    await send(
        loaded,
        connection,
        expenses.websocket_restore_expense,
        {"group_id": project["group"].id, "expense_id": expense.id},
    )

    assert connection.errors[1][0] == "not_allowed"

    # And it goes through the moment the project allows it.
    await close_project(manager, project["group"].id, Permission.EDIT_OTHERS)

    allowed = FakeConnection(PLAIN)

    await send(
        loaded,
        allowed,
        expenses.websocket_restore_expense,
        {"group_id": project["group"].id, "expense_id": expense.id},
    )

    assert allowed.errors == {}


async def test_you_may_restore_what_was_yours(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """Asked of the deletion, since there is no row left to ask."""

    await close_project(manager, project["group"].id)

    expense = await an_expense(
        manager,
        project,
        paid_by_member_id=project["plain"].id,
        actor_user_id=ADMIN,
    )

    await manager.delete_expense(expense.id, actor_user_id=ADMIN)

    connection = FakeConnection(PLAIN)

    await send(
        loaded,
        connection,
        expenses.websocket_restore_expense,
        {"group_id": project["group"].id, "expense_id": expense.id},
    )

    assert connection.errors == {}


#
# Payments, the same way
#


async def test_a_restored_payment_is_the_one_that_was_deleted(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    payment = await manager.create_payment(
        group_id=project["group"].id,
        from_member_id=project["admin"].id,
        to_member_id=project["plain"].id,
        amount=2000,
        payment_date=NOW,
        description="Le pret de juin",
        kind=PaymentKind.DEBT,
        actor_user_id=ADMIN,
    )

    await manager.delete_payment(payment.id, actor_user_id=ADMIN)

    connection = FakeConnection(ADMIN)

    await send(
        loaded,
        connection,
        payments.websocket_restore_payment,
        {"group_id": project["group"].id, "payment_id": payment.id},
    )

    assert connection.errors == {}

    back = await manager.get_payment(payment.id)

    assert back.id == payment.id
    assert back.kind is PaymentKind.DEBT
    assert back.description == "Le pret de juin"
    assert back.from_member_id == payment.from_member_id
    assert back.to_member_id == payment.to_member_id
    assert back.amount == payment.amount
    assert back.exchange_rate == payment.exchange_rate


#
# The past, which has no snapshot
#


async def test_an_old_deletion_still_restores(
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """Deletions written before snapshots existed carry fewer fields.

    They are still restorable: the money is worked out again, for the expense's
    own day — the rate of a day gone by does not move, so it lands on the very
    one it was frozen at. Simulated by stripping the snapshot back to what the
    old code wrote.
    """

    from custom_components.shared_expenses.helpers import revisions as helper

    expense = await an_expense(manager, project, amount=8542)

    await manager.delete_expense(expense.id, actor_user_id=ADMIN)

    history = await manager.list_entity_revisions(project["group"].id, expense.id)
    deletion = history[0]

    old = tuple(
        change
        for change in deletion.changes
        if change.field
        in {
            "title",
            "description",
            "amount",
            "currency",
            "paid_by_member_id",
            "expense_date",
            "category_id",
            "shares",
        }
    )

    assert helper.from_changes(old).get("exchange_rate") is None

    await manager.database.revision_repository.create(
        type(deletion)(
            id="01OLDDELETION",
            group_id=deletion.group_id,
            entity_type=deletion.entity_type,
            entity_id=deletion.entity_id,
            entity_label=deletion.entity_label,
            action=deletion.action,
            actor_user_id=deletion.actor_user_id,
            changes=old,
            at=datetime(2026, 7, 15, 12, 0, tzinfo=UTC),
        )
    )

    await manager.restore_expense(project["group"].id, expense.id, actor_user_id=ADMIN)

    back = await manager.get_expense(expense.id)

    assert back.amount == 8542
    assert back.converted_amount == 8542
    assert back.exchange_rate == RATE_ONE
