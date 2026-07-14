"""The Shared Expenses integration."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .manager import SharedExpensesManager
from .panel import async_register_panel, async_unregister_panel
from .storage.database import Database
from .websocket import async_setup as async_setup_websocket


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Shared Expenses from a config entry."""

    database = Database(hass)
    await database.initialize()

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = SharedExpensesManager(database)

    async_setup_websocket(hass)

    await async_register_panel(hass)

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""

    manager: SharedExpensesManager = hass.data[DOMAIN].pop(entry.entry_id)

    await manager.database.close()

    if not hass.data[DOMAIN]:
        hass.data.pop(DOMAIN)

        async_unregister_panel(hass)

    return True
