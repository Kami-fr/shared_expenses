"""Tests for what the dashboard says, and for what it refuses to say.

What is covered is the arithmetic and the availability — the sensor classes are
plain objects, so they can be built against a snapshot and asked. What is not is
the wiring: forwarding the platforms, the entity registry, entities appearing as
a project starts exposing itself. That needs a running Home Assistant, and
`pytest-homeassistant-custom-component` cannot be installed here (see conftest).
The same line the WebSocket tests draw: everything this integration wrote, and
not the transport under it.

The one worth the most is the last: a project that stops exposing itself must go
unavailable rather than sit on its last known balance. That is the whole switch.
"""

from __future__ import annotations

from dataclasses import replace
from datetime import UTC, datetime
from types import SimpleNamespace
from typing import Any

import pytest

from custom_components.shared_expenses.binary_sensor import OutstandingBinarySensor
from custom_components.shared_expenses.coordinator import (
    GroupSnapshot,
    SharedExpensesCoordinator,
)
from custom_components.shared_expenses.manager import SharedExpensesManager
from custom_components.shared_expenses.sensor import BalanceSensor, LastActivitySensor
from tests.conftest import ADMIN, PLAIN

NOW = datetime(2026, 7, 14, 12, 0, tzinfo=UTC)


class FakeCoordinator:
    """Stand-in for the coordinator: entities only ever read `data` off it.

    `last_update_success` is what `CoordinatorEntity.available` reads, so it is
    here — a stand-in that answers less than the real one tests less than it
    claims to.
    """

    def __init__(self, data: dict[str, GroupSnapshot]) -> None:
        """Hold the snapshots the entities will read."""

        self.data = data
        self.last_update_success = True
        self.config_entry = SimpleNamespace(entry_id="entry-id")

    def async_add_listener(self, *_args: Any, **_kwargs: Any) -> Any:
        """Entities register on construction. Nothing here listens."""

        return lambda: None


def a_snapshot(**over: Any) -> GroupSnapshot:
    """Return one project as the coordinator would have read it."""

    group = SimpleNamespace(id="g1", name="Montigny", currency="EUR", exposed=True)

    members = (
        SimpleNamespace(id="m1", name="Stephane"),
        SimpleNamespace(id="m2", name="Antonin"),
    )

    return GroupSnapshot(
        **{
            "group": over.pop("group", group),
            "members": over.pop("members", members),
            "balances": over.pop("balances", {"m1": 4_271, "m2": -4_271}),
            "settled": over.pop("settled", False),
            "last_activity": over.pop("last_activity", NOW),
            **over,
        }
    )


def a_balance(snapshot: GroupSnapshot | None, member_id: str = "m2") -> BalanceSensor:
    """Return a balance sensor over one snapshot, or over nothing."""

    data = {} if snapshot is None else {"g1": snapshot}

    return BalanceSensor(FakeCoordinator(data), "g1", member_id)


def refresh(sensor: BalanceSensor, snapshot: GroupSnapshot) -> None:
    """Hand the sensor a new snapshot, the way the coordinator would.

    The state write is silenced: it is Home Assistant's, it needs a live one,
    and it is not what any of this is about. What runs is the entity's own
    update — which is where the name is decided.
    """

    sensor.coordinator.data = {"g1": snapshot}
    sensor.async_write_ha_state = lambda: None
    sensor._handle_coordinator_update()


#
# The money
#


def test_a_balance_is_money_rather_than_cents() -> None:
    """The one place this integration hands out a float, and the only sane one.

    A monetary sensor is read as money: 4271 would be read as four thousand
    euros owed rather than forty-two.
    """

    assert a_balance(a_snapshot()).native_value == -42.71


def test_a_balance_keeps_the_model_s_own_sign() -> None:
    """Positive is owed to them, negative is owed by them.

    There is no "you" to flip it for: a sensor is read by everybody, so the
    panel's whole way of speaking has nowhere to land here.
    """

    snapshot = a_snapshot()

    assert a_balance(snapshot, "m1").native_value == 42.71
    assert a_balance(snapshot, "m2").native_value == -42.71


def test_a_member_with_nothing_outstanding_reads_zero() -> None:
    """Not unknown: nothing owed is a fact, and zero says it."""

    assert a_balance(a_snapshot(balances={})).native_value == 0


def test_a_balance_is_counted_in_the_project_s_currency() -> None:
    group = SimpleNamespace(id="g1", name="Ski", currency="CHF", exposed=True)

    assert a_balance(a_snapshot(group=group)).native_unit_of_measurement == "CHF"


def test_a_balance_is_named_for_whose_it_is() -> None:
    assert a_balance(a_snapshot()).name == "Antonin"


def test_a_balance_keeps_its_id_when_somebody_is_renamed() -> None:
    """Which is the whole reason a member has an id of their own."""

    renamed = (
        SimpleNamespace(id="m1", name="Stephane"),
        SimpleNamespace(id="m2", name="Antonin R."),
    )

    before = a_balance(a_snapshot())
    after = a_balance(a_snapshot(members=renamed))

    assert before.unique_id == after.unique_id
    assert after.name == "Antonin R."


def test_a_rename_reaches_a_sensor_already_built() -> None:
    """The name follows, rather than being frozen at whatever it was built on."""

    sensor = a_balance(a_snapshot())

    assert sensor.name == "Antonin"

    refresh(
        sensor,
        a_snapshot(
            members=(
                SimpleNamespace(id="m1", name="Stephane"),
                SimpleNamespace(id="m2", name="Antonin R."),
            ),
        ),
    )

    assert sensor.name == "Antonin R."


def test_somebody_who_left_keeps_their_name() -> None:
    """A nameless entity is not anonymous.

    Home Assistant reads one as the device's own and calls it after the project,
    so the sensor of a member who had gone read "Montigny — unavailable", which
    says the project is broken rather than that somebody left. The name is held
    and never given back.
    """

    sensor = a_balance(a_snapshot())

    assert sensor.name == "Antonin"

    refresh(sensor, a_snapshot(members=(SimpleNamespace(id="m1", name="Stephane"),)))

    assert sensor.available is False
    assert sensor.name == "Antonin", "a departed member must not become the project"


#
# The switch, which is the point of all of it
#


def test_a_project_that_stops_exposing_itself_says_nothing() -> None:
    """Unavailable, not the last figure it knew.

    Whoever closed the switch meant the figures to go. A sensor sitting on its
    last known balance would be exactly the leak it was closed to stop — and it
    would look current, which is worse than looking gone.
    """

    sensor = a_balance(None)

    assert sensor.available is False
    assert sensor.native_value is None


def test_a_deleted_project_says_nothing_either() -> None:
    """The same thing, and it is the same thing: it is not in the snapshots."""

    assert a_balance(None).available is False


def test_somebody_who_left_takes_their_sensor_with_them() -> None:
    """Their balance is not the dashboard's business any more."""

    alone = (SimpleNamespace(id="m1", name="Stephane"),)

    sensor = a_balance(a_snapshot(members=alone), "m2")

    assert sensor.available is False


def test_a_member_still_in_the_project_is_available() -> None:
    assert a_balance(a_snapshot()).available is True


#
# Settled, and when it was last used
#


@pytest.mark.parametrize(("settled", "expected"), [(True, False), (False, True)])
def test_outstanding_is_on_while_something_is_owed(
    settled: bool,
    expected: bool,
) -> None:
    """On means there is something to do, which is what a lit dot reads as."""

    snapshot = a_snapshot(settled=settled)
    sensor = OutstandingBinarySensor(FakeCoordinator({"g1": snapshot}), "g1")

    assert sensor.is_on is expected


def test_outstanding_says_nothing_about_a_project_it_cannot_see() -> None:
    sensor = OutstandingBinarySensor(FakeCoordinator({}), "g1")

    assert sensor.is_on is None
    assert sensor.available is False


def test_last_activity_is_when_something_was_entered() -> None:
    sensor = LastActivitySensor(FakeCoordinator({"g1": a_snapshot()}), "g1")

    assert sensor.native_value == NOW


def test_a_project_nobody_has_used_has_no_last_activity() -> None:
    """Unknown, and it is: nothing has happened."""

    snapshot = a_snapshot(last_activity=None)
    sensor = LastActivitySensor(FakeCoordinator({"g1": snapshot}), "g1")

    assert sensor.native_value is None


#
# What the coordinator reads, against a real database
#


class Probe(SharedExpensesCoordinator):
    """The real coordinator, minus the constructor Home Assistant needs for it.

    `DataUpdateCoordinator.__init__` wants a live instance — it reaches for the
    frame helper and the current config entry, and refuses a stand-in. But
    `_async_update_data` reads nothing except the manager, so the method under
    test is the real one; only the scaffolding around it is skipped.

    Which matters more than it looks: the line this reaches is the only thing
    standing between a closed switch and a balance on somebody's dashboard.
    """

    def __init__(self, manager: SharedExpensesManager) -> None:
        self._manager = manager


async def test_the_snapshot_only_holds_projects_that_asked(
    manager: SharedExpensesManager,
    project: dict[str, Any],
) -> None:
    """The wall, such as it is. Nothing else decides.

    Entities are read by every account in the house, so a project that has not
    said yes must not reach the coordinator at all — not be filtered later, not
    be built and hidden. It must not be there.
    """

    assert await Probe(manager)._async_update_data() == {}

    await manager.update_group(
        replace(project["group"], exposed=True),
        actor_user_id=ADMIN,
    )

    snapshots = await Probe(manager)._async_update_data()

    assert list(snapshots) == [project["group"].id]


async def test_a_snapshot_is_the_project_at_one_moment(
    manager: SharedExpensesManager,
    project: dict[str, Any],
) -> None:
    """Balances and "settled" come from one read, so they cannot disagree."""

    await manager.update_group(
        replace(project["group"], exposed=True),
        actor_user_id=ADMIN,
    )

    empty = (await Probe(manager)._async_update_data())[project["group"].id]

    assert empty.settled is True
    assert empty.last_activity is None

    await manager.create_expense(
        group_id=project["group"].id,
        title="Courses",
        amount=8_542,
        paid_by_member_id=project["admin"].id,
        expense_date=NOW,
        actor_user_id=ADMIN,
    )

    snapshot = (await Probe(manager)._async_update_data())[project["group"].id]

    assert snapshot.settled is False
    assert snapshot.last_activity is not None
    assert sum(snapshot.balances.values()) == 0, "a balance sheet has to balance"


async def test_closing_the_switch_takes_the_project_back_off(
    manager: SharedExpensesManager,
    project: dict[str, Any],
) -> None:
    """And it goes, rather than lingering with what it last knew."""

    await manager.update_group(
        replace(project["group"], exposed=True),
        actor_user_id=ADMIN,
    )

    assert await Probe(manager)._async_update_data() != {}

    group = await manager.get_group(project["group"].id)

    await manager.update_group(replace(group, exposed=False), actor_user_id=ADMIN)

    assert await Probe(manager)._async_update_data() == {}


async def test_opening_the_dashboard_is_written_in_the_journal(
    manager: SharedExpensesManager,
    project: dict[str, Any],
) -> None:
    """It takes a wall down. That is exactly what somebody asks about later."""

    await manager.update_group(
        replace(project["group"], exposed=True),
        actor_user_id=PLAIN,
    )

    entries = await manager.list_revisions(project["group"].id)

    change = next(c for c in entries[0].changes if c.field == "exposed")

    assert change.before is False
    assert change.after is True
    assert entries[0].actor_user_id == PLAIN
