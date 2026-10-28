"""Tests for checking a group's expenses: the correction, and "this is right".

What looks wrong is the panel's to work out. What is proved here is what the
backend promises once somebody acts on it: a name or a category set right
moves no money, a figure set right is spread as the old one was, several
expenses are corrected together or not at all, nobody corrects what they
could not have changed by hand, and an alert answered "this is right" stays
answered.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

import pytest
import voluptuous as vol

from custom_components.shared_expenses.exceptions import (
    GroupArchivedError,
    InvalidExpenseError,
)
from custom_components.shared_expenses.manager import SharedExpensesManager
from custom_components.shared_expenses.models import (
    ExpenseShare,
    Permission,
    RevisionAction,
    RevisionEntity,
    SplitRule,
)
from custom_components.shared_expenses.websocket import checks
from tests.conftest import ADMIN, PLAIN, FakeConnection, FakeHass, close_project, send

NOW = datetime(2026, 10, 20, 12, 0, tzinfo=UTC)


async def bought(
    manager: SharedExpensesManager, project: dict[str, Any], title: str, **kwargs
):
    """Return an expense paid by the admin, split by the rule asked for or equally."""

    return await manager.create_expense(
        group_id=project["group"].id,
        title=title,
        amount=kwargs.pop("amount", 1090),
        paid_by_member_id=kwargs.pop("payer", project["admin"]).id,
        expense_date=NOW,
        actor_user_id=kwargs.pop("actor", ADMIN),
        **kwargs,
    )


async def shares_of(manager: SharedExpensesManager, expense_id: str) -> dict[str, int]:
    return {
        share.member_id: share.amount
        for share in await manager.get_expense_shares(expense_id)
    }


async def test_four_spellings_become_one_and_no_money_moves(
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    right = await bought(manager, project, "Leclerc")
    wrong = [
        await bought(manager, project, title, amount=amount)
        for title, amount in (("leclerc ", 2000), ("LECLERC", 3001), ("Lecelrc", 999))
    ]
    before = {expense.id: await shares_of(manager, expense.id) for expense in wrong}

    corrected = await manager.correct_expenses(
        project["group"].id,
        [right.id, *(expense.id for expense in wrong)],
        {"title": "Leclerc"},
        actor_user_id=ADMIN,
    )

    assert [expense.title for expense in corrected] == ["Leclerc"] * 4

    for expense in wrong:
        assert await shares_of(manager, expense.id) == before[expense.id]

    renamed = [
        revision
        for revision in await manager.list_revisions(project["group"].id)
        if revision.action is RevisionAction.UPDATED
    ]

    # One line each, as by hand; none for the one that was already right.
    assert sorted(revision.entity_id for revision in renamed) == sorted(
        expense.id for expense in wrong
    )
    assert all(revision.entity_type is RevisionEntity.EXPENSE for revision in renamed)
    assert all(revision.actor_user_id == ADMIN for revision in renamed)


async def test_a_category_set_right_keeps_the_shares_its_rule_would_change(
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    groceries = await manager.create_category(
        group_id=project["group"].id, name="Courses"
    )
    # Everything to the admin: what re-splitting under it would do is obvious.
    mine = await manager.create_category(
        group_id=project["group"].id,
        name="Perso",
        split_rule=SplitRule(participants=(project["admin"].id,)),
    )
    expense = await bought(
        manager, project, "Leclerc", amount=3000, category_id=groceries.id
    )
    before = await shares_of(manager, expense.id)

    await manager.correct_expenses(
        project["group"].id, [expense.id], {"category_id": mine.id}
    )

    assert (await manager.get_expense(expense.id)).category_id == mine.id
    assert await shares_of(manager, expense.id) == before


async def test_a_figure_set_right_is_spread_as_the_old_one_was(
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    expense = await bought(
        manager,
        project,
        "Boulangerie",
        amount=10_900,
        split_rule=SplitRule(participants=(project["admin"].id, project["plain"].id)),
    )

    await manager.correct_expenses(project["group"].id, [expense.id], {"amount": 1090})

    shares = await shares_of(manager, expense.id)

    assert (await manager.get_expense(expense.id)).amount == 1090
    assert sum(shares.values()) == 1090
    assert set(shares) == {project["admin"].id, project["plain"].id}


async def test_a_figure_is_not_set_right_without_a_rule_to_spread_it(
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    halves = [
        ExpenseShare(
            id="placeholder",
            expense_id="placeholder",
            member_id=member.id,
            amount=5450,
            created_at=NOW,
        )
        for member in (project["admin"], project["plain"])
    ]
    expense = await bought(
        manager, project, "Boulangerie", amount=10_900, shares=halves
    )

    assert expense.split_rule is None

    with pytest.raises(InvalidExpenseError) as refused:
        await manager.correct_expenses(
            project["group"].id, [expense.id], {"amount": 1090}
        )

    assert refused.value.code == "correction_needs_rule"
    assert (await manager.get_expense(expense.id)).amount == 10_900


async def test_a_purchase_is_not_corrected_into_a_refund(
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    expense = await bought(manager, project, "Boulangerie", amount=10_900)

    with pytest.raises(InvalidExpenseError) as refused:
        await manager.correct_expenses(
            project["group"].id, [expense.id], {"amount": -1090}
        )

    assert refused.value.code == "correction_changes_sign"


async def test_a_correction_changes_one_field_and_needs_a_name(
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    expense = await bought(manager, project, "Leclerc")

    for changes, code in (
        ({"title": "Leclerc", "amount": 1}, "correction_one_field"),
        ({"description": "x"}, "correction_one_field"),
        ({"title": "   "}, "expense_title_empty"),
    ):
        with pytest.raises(InvalidExpenseError) as refused:
            await manager.correct_expenses(project["group"].id, [expense.id], changes)

        assert refused.value.code == code


async def test_an_archived_group_is_not_corrected(
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    expense = await bought(manager, project, "leclerc")

    await manager.archive_group(project["group"].id)

    with pytest.raises(GroupArchivedError):
        await manager.correct_expenses(
            project["group"].id, [expense.id], {"title": "Leclerc"}
        )


#
# Through the real commands
#


async def test_one_expense_not_yours_refuses_the_lot(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """All or none: a shop left with two names is what this exists to end."""

    theirs = await bought(manager, project, "leclerc")
    mine = await bought(
        manager, project, "LECLERC", payer=project["plain"], actor=PLAIN
    )

    await close_project(
        manager, project["group"].id, *(set(Permission) - {Permission.EDIT_OTHERS})
    )

    connection = FakeConnection(PLAIN, name="Antonin")

    await send(
        loaded,
        connection,
        checks.websocket_correct_expenses,
        {
            "group_id": project["group"].id,
            "expense_ids": [mine.id, theirs.id],
            "title": "Leclerc",
        },
    )

    assert connection.errors[1][0] == "not_allowed"
    assert (await manager.get_expense(mine.id)).title == "LECLERC"
    assert (await manager.get_expense(theirs.id)).title == "leclerc"

    await send(
        loaded,
        connection,
        checks.websocket_correct_expenses,
        {"group_id": project["group"].id, "expense_ids": [mine.id], "title": "Leclerc"},
    )

    assert [expense["title"] for expense in connection.results[1]] == ["Leclerc"]


async def test_another_household_s_expense_is_not_reached(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    elsewhere = await manager.create_group(
        group_name="Ski", admin_name="Bruno", admin_user_id="ha-bruno"
    )
    bruno = (await manager.list_group_members(elsewhere.id))[0]
    theirs = await manager.create_expense(
        group_id=elsewhere.id,
        title="forfait",
        amount=40_000,
        paid_by_member_id=bruno.id,
        expense_date=NOW,
    )
    connection = FakeConnection(ADMIN)

    # Through my own group, naming their expense.
    await send(
        loaded,
        connection,
        checks.websocket_correct_expenses,
        {
            "group_id": project["group"].id,
            "expense_ids": [theirs.id],
            "title": "Forfait",
        },
    )
    # Through their group, which is not mine.
    await send(
        loaded,
        connection,
        checks.websocket_dismiss_check,
        {"group_id": elsewhere.id, "kind": "names", "key": "forfait"},
    )

    assert connection.errors[1][0] in ("expense_not_found", "group_not_found")
    assert (await manager.get_expense(theirs.id)).title == "forfait"
    assert await manager.list_check_dismissals(elsewhere.id) == []


async def test_this_is_right_stays_answered_and_stays_home(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    connection = FakeConnection(PLAIN, name="Antonin")
    group_id = project["group"].id
    journal = len(await manager.list_revisions(group_id))

    for _ in range(2):
        await send(
            loaded,
            connection,
            checks.websocket_dismiss_check,
            {"group_id": group_id, "kind": "amount", "key": "e1:10900"},
        )

    await send(
        loaded,
        connection,
        checks.websocket_list_check_dismissals,
        {"group_id": group_id},
    )

    assert connection.results[1] == [{"kind": "amount", "key": "e1:10900"}]

    # Not money: nothing in the journal.
    assert len(await manager.list_revisions(group_id)) == journal


def test_a_correction_carries_one_field_and_a_known_kind():
    """Refused by the schema, before anybody looks."""

    with pytest.raises(vol.Invalid):
        checks.websocket_correct_expenses._ws_schema(
            {
                "id": 1,
                "type": "shared_expenses/correct_expenses",
                "group_id": "g",
                "expense_ids": ["e"],
                "title": "Leclerc",
                "amount": 1090,
            }
        )

    with pytest.raises(vol.Invalid):
        checks.websocket_dismiss_check._ws_schema(
            {
                "id": 1,
                "type": "shared_expenses/dismiss_check",
                "group_id": "g",
                "kind": "everything",
                "key": "k",
            }
        )
