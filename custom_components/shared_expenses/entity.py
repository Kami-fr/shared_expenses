"""What every entity of this integration has in common.

One device per project, so the dashboard groups them the way the household
thinks of them; every entity of that project hangs off it.
"""

from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import GroupSnapshot, SharedExpensesCoordinator


class SharedExpensesEntity(CoordinatorEntity[SharedExpensesCoordinator]):
    """An entity of one project."""

    _attr_has_entity_name = True

    def __init__(self, coordinator: SharedExpensesCoordinator, group_id: str) -> None:
        """Bind the entity to its project."""

        super().__init__(coordinator)

        self._group_id = group_id

        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, group_id)},
            # The name it goes by now. Renaming a project renames its device on
            # the next start; the identifier is the id, so nothing is orphaned.
            name=self.snapshot.group.name if self.snapshot else group_id,
            manufacturer="Shared Expenses",
            entry_type=None,
        )

    @property
    def snapshot(self) -> GroupSnapshot | None:
        """This project as the coordinator last read it.

        None once the project is gone, or has stopped exposing itself. The
        entity stays — Home Assistant keeps what it was told about — and says it
        is unavailable rather than a stale figure.
        """

        return (self.coordinator.data or {}).get(self._group_id)

    @property
    def extra_state_attributes(self) -> dict[str, str]:
        """The id of the project, on every one of its entities.

        Not decoration. `add_expense` asks for a project, and a project is this
        integration's own rather than a Home Assistant entity, so no selector
        lists them and nothing on a dashboard knows how to name one. Writing a
        tile meant reading the database.

        Here, it is where Home Assistant expects a fact to be looked up:
        Developer Tools, on any entity of the project the tile is about.
        """

        return {"group_id": self._group_id}

    @property
    def available(self) -> bool:
        """Whether there is anything true to say.

        A project that stopped exposing itself is exactly as unavailable as one
        that was deleted: whoever closed the switch meant the figures to go, and
        a sensor holding its last known balance would be the leak the switch was
        closed to stop.
        """

        return super().available and self.snapshot is not None
