"""Tests for the history: what changed, who did it, and what survives."""

from __future__ import annotations

from dataclasses import replace
from datetime import UTC, datetime

import pytest

from custom_components.shared_expenses.exceptions import InvalidPaymentError
from custom_components.shared_expenses.helpers import revisions
from custom_components.shared_expenses.manager import SharedExpensesManager
from custom_components.shared_expenses.models import (
    FieldChange,
    RevisionAction,
    RevisionEntity,
)

NOW = datetime(2026, 7, 14, 12, 0, tzinfo=UTC)


async def make_group(manager: SharedExpensesManager, **kwargs):
    return await manager.create_group(
        group_name=kwargs.pop("group_name", "Appartement"),
        admin_name=kwargs.pop("admin_name", "Stephane"),
        **kwargs,
    )


async def admin_of(manager: SharedExpensesManager, group_id: str):
    members = await manager.list_group_members(group_id)

    return next(member for member in members if member.name == "Stephane")


def changed(revision, field: str) -> FieldChange:
    return next(change for change in revision.changes if change.field == field)


#
# The pure diff
#


def test_only_fields_on_both_sides_that_differ_are_changes():
    before = {"amount": 100, "title": "Courses", "gone": 1}
    after = {"amount": 200, "title": "Courses", "added": 2}

    result = revisions.diff(before, after)

    assert [change.field for change in result] == ["amount"]
    assert result[0].before == 100
    assert result[0].after == 200


def test_a_field_set_to_nothing_is_a_change():
    """None is a value: clearing a description is something that happened."""

    result = revisions.diff({"description": "au marche"}, {"description": None})

    assert [(c.field, c.before, c.after) for c in result] == [
        ("description", "au marche", None)
    ]


def test_a_creation_carries_the_whole_state():
    result = revisions.creation({"amount": 100, "title": "Courses"})

    assert [(c.field, c.before, c.after) for c in result] == [
        ("amount", None, 100),
        ("title", None, "Courses"),
    ]


def test_a_deletion_carries_the_whole_state():
    """The last place it is written down: it must hold everything."""

    result = revisions.deletion({"amount": 100, "title": "Courses"})

    assert [(c.field, c.before, c.after) for c in result] == [
        ("amount", 100, None),
        ("title", "Courses", None),
    ]


#
# Against a real database
#


async def test_creating_an_expense_records_who_and_what(
    manager: SharedExpensesManager,
):
    group = await make_group(manager)
    admin = await admin_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Courses",
        amount=8542,
        paid_by_member_id=admin.id,
        expense_date=NOW,
        actor_user_id="ha-1",
    )

    history = await manager.list_entity_revisions(group.id, expense.id)

    assert len(history) == 1
    assert history[0].action is RevisionAction.CREATED
    assert history[0].entity_type is RevisionEntity.EXPENSE
    assert history[0].entity_label == "Courses"
    assert history[0].actor_user_id == "ha-1"
    assert changed(history[0], "amount").after == 8542
    assert changed(history[0], "shares").after == {admin.id: 8542}


async def test_an_edited_expense_says_what_moved(manager: SharedExpensesManager):
    """The point of the whole thing: a figure that changed, and by how much."""

    group = await make_group(manager)
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")
    admin = await admin_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Courses",
        amount=8542,
        paid_by_member_id=admin.id,
        expense_date=NOW,
        actor_user_id="ha-1",
    )

    await manager.update_expense(
        replace(expense, amount=9000, title="Courses Carrefour"),
        actor_user_id="ha-2",
    )

    history = await manager.list_entity_revisions(group.id, expense.id)

    assert [revision.action for revision in history] == [
        RevisionAction.UPDATED,
        RevisionAction.CREATED,
    ]

    latest = history[0]

    assert latest.actor_user_id == "ha-2"
    assert (changed(latest, "amount").before, changed(latest, "amount").after) == (
        8542,
        9000,
    )
    assert changed(latest, "title").after == "Courses Carrefour"

    # The shares moved with the amount, and that is the part that is money.
    assert changed(latest, "shares").before == {admin.id: 4271, antonin.id: 4271}
    assert changed(latest, "shares").after == {admin.id: 4500, antonin.id: 4500}


async def test_saving_an_expense_unchanged_records_nothing(
    manager: SharedExpensesManager,
):
    """A save that changed nothing did not happen; noise buries the real ones."""

    group = await make_group(manager)
    admin = await admin_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Courses",
        amount=8542,
        paid_by_member_id=admin.id,
        expense_date=NOW,
    )

    await manager.update_expense(expense)

    history = await manager.list_entity_revisions(group.id, expense.id)

    assert [revision.action for revision in history] == [RevisionAction.CREATED]


async def test_a_deleted_expense_leaves_its_history_behind(
    manager: SharedExpensesManager,
):
    """The whole reason the table holds no foreign key to the expense."""

    group = await make_group(manager)
    admin = await admin_of(manager, group.id)

    expense = await manager.create_expense(
        group_id=group.id,
        title="Essence",
        amount=4000,
        paid_by_member_id=admin.id,
        expense_date=NOW,
    )

    await manager.delete_expense(expense.id, actor_user_id="ha-1")

    history = await manager.list_revisions(group.id)

    assert [revision.action for revision in history] == [
        RevisionAction.DELETED,
        RevisionAction.CREATED,
    ]

    gone = history[0]

    # Named and priced, though the row it describes no longer exists.
    assert gone.entity_label == "Essence"
    assert gone.actor_user_id == "ha-1"
    assert changed(gone, "amount").before == 4000
    assert changed(gone, "amount").after is None


async def test_a_payment_is_accounted_for_too(manager: SharedExpensesManager):
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

    await manager.update_payment(replace(payment, amount=2000), actor_user_id="ha-1")

    history = await manager.list_entity_revisions(group.id, payment.id)

    assert [revision.entity_type for revision in history] == [
        RevisionEntity.PAYMENT,
        RevisionEntity.PAYMENT,
    ]
    latest = history[0]

    assert (changed(latest, "amount").before, changed(latest, "amount").after) == (
        500,
        2000,
    )


async def test_the_history_of_another_group_never_comes_back(
    manager: SharedExpensesManager,
):
    """The group is asked for, never taken from the entity: it walls groups off."""

    mine = await make_group(manager, group_name="Appartement")
    theirs = await make_group(manager, group_name="Ski")
    admin = await admin_of(manager, theirs.id)

    expense = await manager.create_expense(
        group_id=theirs.id,
        title="Forfait",
        amount=4000,
        paid_by_member_id=admin.id,
        expense_date=NOW,
    )

    assert await manager.list_entity_revisions(mine.id, expense.id) == []
    assert len(await manager.list_entity_revisions(theirs.id, expense.id)) == 1


async def test_a_failed_write_records_no_history(manager: SharedExpensesManager):
    """The revision and the change it accounts for stand or fall together."""

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

    history = await manager.list_entity_revisions(group.id, payment.id)

    assert [revision.action for revision in history] == [RevisionAction.CREATED]
