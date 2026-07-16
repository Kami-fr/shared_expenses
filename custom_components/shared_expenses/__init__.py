"""The Shared Expenses integration."""

from __future__ import annotations

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

    coordinator = SharedExpensesCoordinator(hass, manager)

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {
        "manager": manager,
        "coordinator": coordinator,
    }

    # Before the platforms, so the first entities are set up against something
    # rather than against an empty coordinator they would then have to be told
    # about twice.
    await coordinator.async_config_entry_first_refresh()

    coordinator.async_listen()

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    async_setup_websocket(hass)
    async_setup_services(hass)

    await async_register_panel(hass)

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
    the registry opens for that. The switch removes such a device on its own;
    this is for the ones already sitting there when the feature arrived.
    """

    coordinator: SharedExpensesCoordinator = hass.data[DOMAIN][entry.entry_id][
        "coordinator"
    ]

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

    await data["manager"].database.close()

    if not hass.data[DOMAIN]:
        hass.data.pop(DOMAIN)

        async_unload_services(hass)
        async_unregister_panel(hass)

    return True
