"""WebSocket commands for categories."""

from __future__ import annotations

from dataclasses import replace
from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
import voluptuous as vol

from ..manager import SharedExpensesManager
from .api import SPLIT_RULE_SCHEMA, api_command, split_rule_from_msg
from .serializers import category_to_dict


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/list_categories",
        vol.Required("group_id"): cv.string,
    }
)
@websocket_api.async_response
@api_command
async def websocket_list_categories(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Return the categories of a group."""

    categories = await manager.list_categories(msg["group_id"])

    connection.send_result(
        msg["id"],
        [category_to_dict(category) for category in categories],
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/create_category",
        vol.Required("group_id"): cv.string,
        vol.Required("name"): cv.string,
        vol.Optional("icon"): vol.Any(None, cv.string),
        vol.Optional("color"): vol.Any(None, cv.string),
        vol.Optional("split_rule"): vol.Any(None, SPLIT_RULE_SCHEMA),
    }
)
@websocket_api.async_response
@api_command
async def websocket_create_category(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Create a category, with its default split rule."""

    category = await manager.create_category(
        group_id=msg["group_id"],
        name=msg["name"],
        icon=msg.get("icon"),
        color=msg.get("color"),
        split_rule=split_rule_from_msg(msg),
    )

    connection.send_result(msg["id"], category_to_dict(category))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/update_category",
        vol.Required("category_id"): cv.string,
        vol.Optional("name"): cv.string,
        vol.Optional("icon"): vol.Any(None, cv.string),
        vol.Optional("color"): vol.Any(None, cv.string),
        vol.Optional("split_rule"): vol.Any(None, SPLIT_RULE_SCHEMA),
    }
)
@websocket_api.async_response
@api_command
async def websocket_update_category(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Update a category. Only the supplied fields change."""

    category = await manager.get_category(msg["category_id"])

    changes: dict[str, Any] = {
        field: msg[field] for field in ("name", "icon", "color") if field in msg
    }

    if "split_rule" in msg:
        changes["split_rule"] = split_rule_from_msg(msg)

    updated = replace(category, **changes)

    await manager.update_category(updated)

    connection.send_result(msg["id"], category_to_dict(updated))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/delete_category",
        vol.Required("category_id"): cv.string,
    }
)
@websocket_api.async_response
@api_command
async def websocket_delete_category(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Delete a category. Its expenses lose their category."""

    await manager.delete_category(msg["category_id"])

    connection.send_result(msg["id"], None)


COMMANDS = (
    websocket_list_categories,
    websocket_create_category,
    websocket_update_category,
    websocket_delete_category,
)
