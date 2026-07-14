"""WebSocket API for Shared Expenses.

The frontend talks to the integration only through these commands.
"""

from __future__ import annotations

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback

from . import (
    categories,
    expenses,
    groups,
    members,
    payments,
    revisions,
    statistics,
)

COMMANDS = (
    *groups.COMMANDS,
    *members.COMMANDS,
    *categories.COMMANDS,
    *expenses.COMMANDS,
    *payments.COMMANDS,
    *revisions.COMMANDS,
    *statistics.COMMANDS,
)


@callback
def async_setup(hass: HomeAssistant) -> None:
    """Register the WebSocket commands."""

    for command in COMMANDS:
        websocket_api.async_register_command(hass, command)
