"""WebSocket commands for the history."""

from __future__ import annotations

from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
import voluptuous as vol

from ..manager import SharedExpensesManager
from .api import Scope, api_command
from .serializers import revision_to_dict

#: How far back the group journal goes in one call.
DEFAULT_LIMIT = 200


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/list_revisions",
        vol.Required("group_id"): cv.string,
        vol.Optional("limit"): vol.All(int, vol.Range(min=1, max=1000)),
    }
)
@websocket_api.async_response
@api_command(Scope.GROUP)
async def websocket_list_revisions(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Return what happened in a group, newest first."""

    found = await manager.list_revisions(
        msg["group_id"],
        msg.get("limit", DEFAULT_LIMIT),
    )

    connection.send_result(msg["id"], [revision_to_dict(item) for item in found])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/list_entity_revisions",
        vol.Required("group_id"): cv.string,
        vol.Required("entity_id"): cv.string,
    }
)
@websocket_api.async_response
@api_command(Scope.GROUP)
async def websocket_list_entity_revisions(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Return the history of one expense or payment, newest first.

    Scoped on the group rather than on the entity: an expense that has been
    deleted can no longer say which group it belonged to, and its history is
    exactly what is being asked for.
    """

    found = await manager.list_entity_revisions(msg["group_id"], msg["entity_id"])

    connection.send_result(msg["id"], [revision_to_dict(item) for item in found])


COMMANDS = (
    websocket_list_revisions,
    websocket_list_entity_revisions,
)
