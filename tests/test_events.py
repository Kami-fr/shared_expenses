"""Tests for what the manager announces on Home Assistant's own bus.

The actions let an automation write a group; these events let one hear it back —
a notification when an expense lands, a reminder when a debt lingers. Driven
through the real commands, because an event no command reaches is an event
nobody ever gets, and read off a fake bus that keeps what was fired on it.

The announcement rides the same door as the journal: what is worth recording is
what is worth telling the house about, so a write that journals nothing is a
write the bus stays silent on too.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from custom_components.shared_expenses.const import EVENT_CHANGED
from custom_components.shared_expenses.manager import SharedExpensesManager
from custom_components.shared_expenses.websocket import expenses, groups, members
from tests.conftest import ADMIN, FakeConnection, FakeHass, send

NOW = datetime(2026, 7, 14, 12, 0, tzinfo=UTC)


def announced(hass: FakeHass) -> list[dict[str, Any]]:
    """Return the data of every change announced since the bus was last cleared."""

    return [data for name, data in hass.bus.events if name == EVENT_CHANGED]


async def test_adding_an_expense_is_announced(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """A new expense reaches the bus with what an automation triggers on.

    Building the fixture already announced the group and its members, so the log
    is cleared first: what this asserts is the one event the command itself made.
    """

    loaded.bus.events.clear()

    connection = FakeConnection(ADMIN)

    await send(
        loaded,
        connection,
        expenses.websocket_create_expense,
        {
            "group_id": project["group"].id,
            "title": "Courses",
            "amount": 3000,
            "paid_by_member_id": project["admin"].id,
            "expense_date": NOW.isoformat(),
        },
    )

    assert connection.errors == {}

    events = announced(loaded)

    assert len(events) == 1
    assert events[0]["group_id"] == project["group"].id
    assert events[0]["entity"] == "expense"
    assert events[0]["action"] == "created"
    assert events[0]["label"] == "Courses"
    assert events[0]["actor_user_id"] == ADMIN


async def test_deleting_a_group_is_announced_though_it_journals_nothing(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """The one write with no revision still tells the bus a group is gone.

    Its history cascades away with it, so there is nobody to record; an
    automation watching for a group vanishing is a different listener, and it has
    to hear it all the same.
    """

    loaded.bus.events.clear()

    connection = FakeConnection(ADMIN, is_admin=True)

    await send(
        loaded,
        connection,
        groups.websocket_delete_group,
        {"group_id": project["group"].id},
    )

    assert connection.errors == {}

    events = announced(loaded)

    assert len(events) == 1
    assert events[0]["entity"] == "group"
    assert events[0]["action"] == "deleted"
    assert events[0]["group_id"] == project["group"].id


async def test_a_write_that_moves_nothing_stays_silent(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """Renaming a member to the name they already have announces nothing.

    The row is rewritten either way, but no field moved, so the journal records
    nothing — and the bus, riding the same door, says nothing either. An
    automation woken by a no-op would be an automation that cried wolf.
    """

    loaded.bus.events.clear()

    connection = FakeConnection(ADMIN, is_admin=True)

    await send(
        loaded,
        connection,
        members.websocket_update_member,
        {
            "member_id": project["admin"].id,
            "group_id": project["group"].id,
            "name": project["admin"].name,
        },
    )

    assert connection.errors == {}
    assert announced(loaded) == []


async def test_a_write_is_announced_only_once_it_has_landed(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """Through the database's own door, not straight onto the bus.

    Everything that hears this goes back to the one connection it was written
    on, and one told before the COMMIT reads a write that has not landed — or
    one that never will. `test_transactions.py` holds what that door does; this
    holds that the manager still knocks on it, because sending from `_announce`
    directly would pass every test in that file and put the bug straight back.
    """

    door: list[str] = []

    real = manager.database.after_commit

    def watched(action: Any) -> None:
        door.append("knocked")

        real(action)

    manager.database.after_commit = watched  # type: ignore[method-assign]

    loaded.bus.events.clear()

    connection = FakeConnection(ADMIN)

    await send(
        loaded,
        connection,
        expenses.websocket_create_expense,
        {
            "group_id": project["group"].id,
            "title": "Courses",
            "amount": 8_542,
            "paid_by_member_id": project["admin"].id,
            "expense_date": NOW.isoformat(),
        },
    )

    assert connection.errors == {}
    assert door == ["knocked"]
    assert len(announced(loaded)) == 1
