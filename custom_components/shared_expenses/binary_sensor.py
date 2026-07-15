"""Whether a project is square.

The one thing worth automating on: a notification on Sunday if somebody still
owes somebody, and silence otherwise.
"""

from __future__ import annotations

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .const import DOMAIN
from .coordinator import SharedExpensesCoordinator
from .entity import SharedExpensesEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up one per exposed project, now and as more appear."""

    coordinator: SharedExpensesCoordinator = hass.data[DOMAIN][entry.entry_id][
        "coordinator"
    ]

    known: set[str] = set()

    @callback
    def _add_new() -> None:
        added = []

        for group_id in coordinator.data or {}:
            if group_id in known:
                continue

            known.add(group_id)
            added.append(OutstandingBinarySensor(coordinator, group_id))

        if added:
            async_add_entities(added)

    entry.async_on_unload(coordinator.async_add_listener(_add_new))

    _add_new()


class OutstandingBinarySensor(SharedExpensesEntity, BinarySensorEntity):
    """On while somebody still owes somebody in this project.

    No `device_class`, deliberately. `problem` was the obvious fit — a lit dot
    reads as something to do — and it made Home Assistant say "Problem", which
    is a judgement this integration has no business making. A household owing
    each other money is a household, not a fault. And a device class takes the
    state's words with it, so the only way to say "all settled" instead of "OK"
    is to own them.

    On is outstanding rather than settled, so the dot lights when there is
    something to do and every square project stays quiet.
    """

    _attr_translation_key = "outstanding"
    _attr_icon = "mdi:scale-unbalanced"

    def __init__(self, coordinator: SharedExpensesCoordinator, group_id: str) -> None:
        """Bind the sensor to one project."""

        super().__init__(coordinator, group_id)

        self._attr_unique_id = f"{group_id}_outstanding"

    @property
    def is_on(self) -> bool | None:
        """Whether anything is still owed."""

        snapshot = self.snapshot

        return None if snapshot is None else not snapshot.settled
