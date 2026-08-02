"""The Shared Expenses integration."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr

from .const import DOMAIN, PLATFORMS
from .coordinator import SharedExpensesCoordinator
from .manager import SharedExpensesManager
from .panel import async_register_panel, async_unregister_panel
from .services import async_setup_services, async_unload_services
from .storage.database import Database
from .websocket import async_setup as async_setup_websocket


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Shared Expenses from a config entry."""

    database = Database(hass)
    await database.initialize()

    manager = SharedExpensesManager(database)

    coordinator = SharedExpensesCoordinator(hass, entry, manager)

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {
        "manager": manager,
        "coordinator": coordinator,
    }

    try:
        # Before the platforms, so the first entities are set up against
        # something rather than against an empty coordinator they would then
        # have to be told about twice.
        await coordinator.async_config_entry_first_refresh()

        coordinator.async_listen()

        async_setup_websocket(hass)
        async_setup_services(hass)

        await async_register_panel(hass)

        # Last, and that is the point: an entry that fails has to fail whole.
        # Setting the platforms up before the panel meant a bad bundle could
        # tear down entities that were already on somebody's dashboard.
        await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    except Exception:
        # Home Assistant does not unload a setup that never finished, so the
        # file this opened is this function's to give back before a retry opens
        # another one on top of it.
        hass.data[DOMAIN].pop(entry.entry_id, None)

        await database.close()

        raise

    return True


async def async_remove_config_entry_device(
    hass: HomeAssistant,
    entry: ConfigEntry,
    device: dr.DeviceEntry,
) -> bool:
    """Say whether a device may be deleted by hand.

    Home Assistant only shows the delete button when the integration allows it.
    A group still on the dashboard is a live device and stays — deleting it
    would only see it rebuilt on the next refresh. One whose switch is shut, or
    whose group is gone, is the user's to clear away, and this is the one door
    the registry opens for that. A deleted group loses its device on its own; a
    group that only went quiet keeps its entities so the tiles pointing at them
    survive, and this is how somebody who wants them gone anyway says so.
    """

    entries: dict[str, dict[str, Any]] = hass.data.get(DOMAIN, {})
    entry_data = entries.get(entry.entry_id)

    # Asked about an entry that is not loaded — a reload in flight, an entry on
    # its way out. There is nothing here left to protect.
    if entry_data is None:
        return True

    coordinator: SharedExpensesCoordinator = entry_data["coordinator"]

    group_id = next(
        (identifier for domain, identifier in device.identifiers if domain == DOMAIN),
        None,
    )

    return group_id is None or group_id not in (coordinator.data or {})


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""

    if not await hass.config_entries.async_unload_platforms(entry, PLATFORMS):
        return False

    data = hass.data[DOMAIN].pop(entry.entry_id)

    # Before the connection goes, not after. Home Assistant runs what the entry
    # registered through `async_on_unload` only once this has returned, so a
    # refresh already in flight reached for a database that had just closed
    # under it — and the clock would have brought another one along ten minutes
    # later, on a `Database` nobody owns.
    await data["coordinator"].async_shutdown()

    await data["manager"].database.close()

    if not hass.data[DOMAIN]:
        hass.data.pop(DOMAIN)

        async_unload_services(hass)
        async_unregister_panel(hass)

    return True
