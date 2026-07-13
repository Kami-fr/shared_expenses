"""The Shared Expenses integration."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .manager import SharedExpensesManager


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Set up the Shared Expenses integration."""

    hass.data.setdefault(DOMAIN, {})

    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Shared Expenses from a config entry."""

    manager = SharedExpensesManager(hass)

    await manager.initialize()

    hass.data[DOMAIN][entry.entry_id] = manager

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload Shared Expenses."""

    manager: SharedExpensesManager = hass.data[DOMAIN].pop(entry.entry_id)

    await manager.close()

    return True