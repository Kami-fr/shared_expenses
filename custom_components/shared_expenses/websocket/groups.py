"""WebSocket commands for groups."""

from __future__ import annotations

from dataclasses import replace
from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
import voluptuous as vol

from ..const import DEFAULT_CURRENCY
from ..manager import SharedExpensesManager
from .api import SPLIT_RULE_SCHEMA, Scope, api_command, split_rule_from_msg
from .serializers import balances_to_dict, group_to_dict


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/list_groups",
        vol.Optional("include_archived", default=True): bool,
    }
)
@websocket_api.async_response
@api_command(Scope.NONE)
async def websocket_list_groups(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Return the groups the connected account belongs to.

    Never `list_groups()`: a user must not learn that the others exist.
    """

    groups = await manager.list_user_groups(connection.user.id)

    if not msg["include_archived"]:
        groups = [group for group in groups if not group.archived]

    connection.send_result(msg["id"], [group_to_dict(group) for group in groups])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/get_group",
        vol.Required("group_id"): cv.string,
    }
)
@websocket_api.async_response
@api_command(Scope.GROUP)
async def websocket_get_group(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Return a group."""

    group = await manager.get_group(msg["group_id"])

    connection.send_result(msg["id"], group_to_dict(group))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/create_group",
        vol.Required("name"): cv.string,
        vol.Optional("currency", default=DEFAULT_CURRENCY): cv.string,
        vol.Optional("description"): vol.Any(None, cv.string),
        vol.Optional("icon"): vol.Any(None, cv.string),
        vol.Optional("color"): vol.Any(None, cv.string),
        vol.Optional("owner_name"): vol.Any(None, cv.string),
        vol.Optional("split_rule"): vol.Any(None, SPLIT_RULE_SCHEMA),
    }
)
@websocket_api.async_response
@api_command(Scope.NONE)
async def websocket_create_group(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Create a group and its owner."""

    user = connection.user

    group = await manager.create_group(
        group_name=msg["name"],
        owner_name=msg.get("owner_name") or user.name or "Owner",
        owner_user_id=user.id,
        currency=msg["currency"],
        description=msg.get("description"),
        icon=msg.get("icon"),
        color=msg.get("color"),
        split_rule=split_rule_from_msg(msg),
    )

    connection.send_result(msg["id"], group_to_dict(group))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/update_group",
        vol.Required("group_id"): cv.string,
        vol.Optional("name"): cv.string,
        vol.Optional("currency"): cv.string,
        vol.Optional("description"): vol.Any(None, cv.string),
        vol.Optional("icon"): vol.Any(None, cv.string),
        vol.Optional("color"): vol.Any(None, cv.string),
        vol.Optional("split_rule"): vol.Any(None, SPLIT_RULE_SCHEMA),
    }
)
@websocket_api.async_response
@api_command(Scope.GROUP)
async def websocket_update_group(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Update a group. Only the supplied fields change."""

    group = await manager.get_group(msg["group_id"])

    changes: dict[str, Any] = {
        field: msg[field]
        for field in ("name", "currency", "description", "icon", "color")
        if field in msg
    }

    if "split_rule" in msg:
        changes["split_rule"] = split_rule_from_msg(msg)

    updated = replace(group, **changes)

    await manager.update_group(updated)

    connection.send_result(msg["id"], group_to_dict(updated))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/archive_group",
        vol.Required("group_id"): cv.string,
        vol.Optional("archived", default=True): bool,
    }
)
@websocket_api.async_response
@api_command(Scope.GROUP)
async def websocket_archive_group(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Archive or restore a group."""

    if msg["archived"]:
        await manager.archive_group(msg["group_id"])
    else:
        await manager.restore_group(msg["group_id"])

    group = await manager.get_group(msg["group_id"])

    connection.send_result(msg["id"], group_to_dict(group))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/delete_group",
        vol.Required("group_id"): cv.string,
    }
)
@websocket_api.async_response
@api_command(Scope.GROUP)
async def websocket_delete_group(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Delete a group and everything it contains."""

    await manager.delete_group(msg["group_id"])

    connection.send_result(msg["id"], None)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/get_balances",
        vol.Required("group_id"): cv.string,
    }
)
@websocket_api.async_response
@api_command(Scope.GROUP)
async def websocket_get_balances(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Return the balances of a group and how to clear them."""

    result = await manager.get_balances(msg["group_id"])

    connection.send_result(msg["id"], balances_to_dict(result))


COMMANDS = (
    websocket_list_groups,
    websocket_get_group,
    websocket_create_group,
    websocket_update_group,
    websocket_archive_group,
    websocket_delete_group,
    websocket_get_balances,
)
