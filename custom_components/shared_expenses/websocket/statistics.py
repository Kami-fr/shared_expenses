"""WebSocket commands for the statistics."""

from __future__ import annotations

from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
import voluptuous as vol

from ..manager import SharedExpensesManager
from .api import Scope, api_command
from .serializers import statistics_to_dict


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/get_statistics",
        vol.Required("group_id"): cv.string,
        # One period or none: a month already names its year, and a year and a
        # month sent together would have to agree for nothing.
        vol.Exclusive("year", "period"): vol.Any(
            None,
            vol.All(int, vol.Range(min=1970, max=9999)),
        ),
        vol.Exclusive("month", "period"): vol.Match(r"^\d{4}-(0[1-9]|1[0-2])$"),
    }
)
@websocket_api.async_response
@api_command(Scope.GROUP)
async def websocket_get_statistics(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Return what a group spent, over a month, a year or everything."""

    result = await manager.get_statistics(
        msg["group_id"], msg.get("year"), msg.get("month")
    )

    connection.send_result(msg["id"], statistics_to_dict(result))


COMMANDS = (websocket_get_statistics,)
