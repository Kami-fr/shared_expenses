"""The Shared Expenses integration."""

from __future__ import annotations

from collections.abc import Callable
from datetime import datetime
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.event import async_track_time_change
from homeassistant.helpers.start import async_at_started
from homeassistant.util import dt as dt_util

from .const import DOMAIN, PLATFORMS, RECURRING_DUE_HOUR
from .coordinator import SharedExpensesCoordinator
from .manager import SharedExpensesManager
from .panel import (
    async_register_panel,
    async_unregister_panel,
    async_withdraw_bundle,
)
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

    hass.data[DOMAIN][entry.entry_id]["stop_mornings"] = _watch_mornings(
        hass, manager
    )

    return True


def _watch_mornings(
    hass: HomeAssistant,
    manager: SharedExpensesManager,
) -> Callable[[], None]:
    """Tell the bus about recurring expenses falling due, every morning.

    At `RECURRING_DUE_HOUR`, local time, and once Home Assistant has started if
    that hour is already past — so an occurrence that fell due while it was off
    is told the day it comes back, not the day after. Not before the hour,
    though: a restart at three in the morning is no reason to wake a phone, and
    the morning check will say it in time. Started, not set up: an automation
    listening for the event is not there to hear it any earlier.

    Returns what stops it.
    """

    async def _check(now: datetime) -> None:
        """Announce what is due today."""

        await manager.announce_due(dt_util.as_local(now).date())

    async def _on_start(_hass: HomeAssistant) -> None:
        """Catch up on a morning spent switched off."""

        now = dt_util.now()

        if now.hour >= RECURRING_DUE_HOUR:
            await _check(now)

    stop_start = async_at_started(hass, _on_start)
    stop_clock = async_track_time_change(
        hass, _check, hour=RECURRING_DUE_HOUR, minute=0, second=0
    )

    def _stop() -> None:
        """Stop both."""

        stop_start()
        stop_clock()

    return _stop


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

    # Before the database closes, for the same reason as the coordinator below.
    data["stop_mornings"]()

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


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Clean up after the entry is deleted, which an unload is not.

    The bundle copied into `www/` and the Lovelace resource that names it were
    made for a dashboard opened before this integration loads. Without the
    integration they would have a dashboard load a card that has nothing to
    talk to, so they go with it.
    """

    await async_withdraw_bundle(hass)
