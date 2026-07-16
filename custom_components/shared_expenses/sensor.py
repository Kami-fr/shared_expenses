"""Sensors for a project that puts itself on the dashboard.

What it has spent, a balance per member, and when it was last used.

There is no "you" here, and there cannot be. An entity's state is the same for
everybody who reads it, so the whole way the panel talks — "you are owed", green
when the money comes your way — has no meaning on a dashboard. A balance is
named for whose it is, and its sign is the model's own: positive is owed to
them, negative is owed by them.
"""

from __future__ import annotations

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import DOMAIN
from .coordinator import SharedExpensesCoordinator
from .entity import SharedExpensesEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the sensors, and keep them in step with what is exposed.

    A project can start exposing itself, and somebody can join one, long after
    Home Assistant started. So this does not run once over what exists: it runs
    again on every refresh, adding what it has not added before — and taking
    down what has left.

    A project that closes its switch, or is deleted, drops out of the
    coordinator. Its device is removed rather than left unavailable: whoever
    shut the switch meant the figures gone, and a device sitting there
    unavailable is the rot they asked not to keep. Removing the device takes its
    entities with it. A card pointing at one of them will show the loss — which
    is the honest price of the switch doing what it says.
    """

    coordinator: SharedExpensesCoordinator = hass.data[DOMAIN][entry.entry_id][
        "coordinator"
    ]

    devices = dr.async_get(hass)
    known: set[str] = set()

    @callback
    def _reconcile() -> None:
        data = coordinator.data or {}

        added = []

        for group_id, snapshot in data.items():
            if group_id not in known:
                known.add(group_id)
                added.append(TotalSpentSensor(coordinator, group_id))
                added.append(LastActivitySensor(coordinator, group_id))

            for member in snapshot.members:
                key = f"{group_id}:{member.id}"

                if key in known:
                    continue

                known.add(key)
                added.append(BalanceSensor(coordinator, group_id, member.id))

        if added:
            async_add_entities(added)

        _forget(data)

    @callback
    def _forget(data: dict[str, object]) -> None:
        """Remove the device of any group no longer on the dashboard.

        Its snapshot is gone from the coordinator, so it is missing from `data`.
        The tracking set forgets it as well, or switching the group back on
        would find it "already added" and rebuild nothing.
        """

        for device in dr.async_entries_for_config_entry(devices, entry.entry_id):
            group_id = next(
                (value for domain, value in device.identifiers if domain == DOMAIN),
                None,
            )

            if group_id is None or group_id in data:
                continue

            devices.async_remove_device(device.id)

            known.discard(group_id)
            known.difference_update(
                {key for key in known if key.startswith(f"{group_id}:")}
            )

    entry.async_on_unload(coordinator.async_add_listener(_reconcile))

    _reconcile()


class MoneySensor(SharedExpensesEntity, SensorEntity):
    """A sensor carrying money, counted in the project's own currency.

    `TOTAL` rather than `TOTAL_INCREASING`: both of these go down. A balance
    swings, and a project's spending drops when an expense is deleted.
    """

    _attr_device_class = SensorDeviceClass.MONETARY
    _attr_state_class = SensorStateClass.TOTAL

    @property
    def native_unit_of_measurement(self) -> str | None:
        """The project's own currency, which is what its money is counted in."""

        return self.snapshot.group.currency if self.snapshot else None

    @staticmethod
    def _money(cents: int) -> float:
        """Turn the model's cents into what a monetary sensor is read as.

        The only place this integration hands out a float. Everything inside it
        is integer cents on purpose — no rounding drift, ever — but a monetary
        sensor is read as money, and 8542 would be read as eight thousand euros.
        Dividing by a hundred at the very edge is exact for anything a household
        will ever owe or spend: a float carries fifteen digits, and this has at
        most a dozen.
        """

        return cents / 100


class TotalSpentSensor(MoneySensor):
    """What the project has spent since it started.

    Expenses only, like every total this integration shows: a reimbursement
    moves money between members, it does not spend any.

    This is the project's whole life, so it only ever means much next to
    something — the same figure the statistics page shows, and the one a
    household compares to last year.
    """

    _attr_icon = "mdi:cash-multiple"
    _attr_translation_key = "total_spent"

    def __init__(self, coordinator: SharedExpensesCoordinator, group_id: str) -> None:
        """Bind the sensor to one project."""

        super().__init__(coordinator, group_id)

        self._attr_unique_id = f"{group_id}_total_spent"

    @property
    def native_value(self) -> float | None:
        """What it has spent, in units rather than in cents."""

        snapshot = self.snapshot

        return None if snapshot is None else self._money(snapshot.total)


class BalanceSensor(MoneySensor):
    """What one member of one project is owed, or owes."""

    _attr_icon = "mdi:scale-balance"

    def __init__(
        self,
        coordinator: SharedExpensesCoordinator,
        group_id: str,
        member_id: str,
    ) -> None:
        """Bind the sensor to one member of one project."""

        super().__init__(coordinator, group_id)

        self._member_id = member_id

        # Ids, never names: somebody renamed keeps their entity and their
        # history, which is the whole reason a member has an id of their own.
        self._attr_unique_id = f"{group_id}_{member_id}_balance"

        # The name they go by now, and it is never given back.
        #
        # This was a property returning None once they left the project, which
        # is not the same as having no name: Home Assistant reads a nameless
        # entity as the device's own and calls it after the project. So the
        # sensor of somebody who had gone read "The Flat — unavailable", which
        # says the project is broken rather than that somebody left.
        #
        # Held instead, and only ever replaced by a better one. A member always
        # exists at the moment their sensor is built — that is what built it —
        # so this starts true and stays true.
        self._attr_name = self._member_name()

    def _member_name(self) -> str | None:
        """Return what the member is called, while the project still has them."""

        snapshot = self.snapshot

        if snapshot is None:
            return None

        return next(
            (
                member.name
                for member in snapshot.members
                if member.id == self._member_id
            ),
            None,
        )

    @callback
    def _handle_coordinator_update(self) -> None:
        """Follow a rename, and keep the name through a departure."""

        if name := self._member_name():
            self._attr_name = name

        super()._handle_coordinator_update()

    @property
    def available(self) -> bool:
        """Gone from the project is gone from the dashboard, figure and all."""

        snapshot = self.snapshot

        if snapshot is None or not super().available:
            return False

        return any(member.id == self._member_id for member in snapshot.members)

    @property
    def extra_state_attributes(self) -> dict[str, str]:
        """The project's id, and the one thing only this sensor knows.

        `add_expense` asks who paid, and a member is no more a Home Assistant
        entity than a project is. This is the only place their id is written
        down: the person's own sensor, which is where somebody writing a tile
        about them would think to look.
        """

        return {**super().extra_state_attributes, "member_id": self._member_id}

    @property
    def native_value(self) -> float | None:
        """The balance, in units rather than in cents.

        Zero for a member the balances do not mention: owing nothing is a fact,
        and zero says it. Unknown would say the sensor could not find out.
        """

        snapshot = self.snapshot

        if snapshot is None:
            return None

        return self._money(snapshot.balances.get(self._member_id, 0))


class LastActivitySensor(SharedExpensesEntity, SensorEntity):
    """When something was last entered into the project."""

    _attr_device_class = SensorDeviceClass.TIMESTAMP
    _attr_icon = "mdi:history"
    _attr_translation_key = "last_activity"

    def __init__(self, coordinator: SharedExpensesCoordinator, group_id: str) -> None:
        """Bind the sensor to one project."""

        super().__init__(coordinator, group_id)

        self._attr_unique_id = f"{group_id}_last_activity"

    @property
    def native_value(self):
        """When the last expense or payment was entered.

        None in a project nobody has used yet, which reads as unknown — and is.
        """

        return self.snapshot.last_activity if self.snapshot else None
