"""The Shared Expenses integration."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Set up the Shared Expenses integration."""

    hass.data.setdefault(DOMAIN, {})

    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Shared Expenses from a config entry."""

    hass.data[DOMAIN][entry.entry_id] = {}

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload Shared Expenses."""

    hass.data[DOMAIN].pop(entry.entry_id)

    return True