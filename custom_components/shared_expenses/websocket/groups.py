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
from ..models import Permission
from .api import (
    PERMISSIONS_SCHEMA,
    SPLIT_RULE_SCHEMA,
    Requires,
    Scope,
    api_command,
    permissions_from_msg,
    split_rule_from_msg,
)
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
        vol.Optional("admin_name"): vol.Any(None, cv.string),
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
    """Create a group, run by whoever asked for it."""

    user = connection.user

    group = await manager.create_group(
        group_name=msg["name"],
        admin_name=msg.get("admin_name") or user.name or "Admin",
        admin_user_id=user.id,
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
        vol.Optional("default_category_id"): vol.Any(None, cv.string),
        vol.Optional("permissions"): PERMISSIONS_SCHEMA,
    }
)
@websocket_api.async_response
@api_command(Scope.GROUP, Permission.MANAGE_GROUP)
async def websocket_update_group(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Update a group. Only the supplied fields change.

    The fields are listed by hand, which is the trap this file has fallen into
    before: a field the model knows and this tuple does not is a field nobody
    can ever change, and the save answers that it went fine. Anything added to
    `Group` belongs here the same day.
    """

    group = await manager.get_group(msg["group_id"])

    changes: dict[str, Any] = {
        field: msg[field]
        for field in (
            "name",
            "currency",
            "description",
            "icon",
            "color",
            "default_category_id",
        )
        if field in msg
    }

    if "split_rule" in msg:
        changes["split_rule"] = split_rule_from_msg(msg)

    if "permissions" in msg:
        # Who may do what is the admin's to say, whatever the group allows its
        # members: a group that let them manage it would otherwise let them hand
        # themselves everything else, and the switches would guard nothing.
        await manager.ensure_admin(msg["group_id"], connection.user.id)

        changes["permissions"] = permissions_from_msg(msg)

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
@api_command(Scope.GROUP, Permission.MANAGE_GROUP)
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
@api_command(Scope.GROUP, Requires.ADMIN)
async def websocket_delete_group(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Delete a group and everything it contains.

    The admin's alone, and never a switch: it takes every expense in the group
    with it, and there is no undoing it. Until recently any member could.
    """

    await manager.delete_group(msg["group_id"])

    connection.send_result(msg["id"], None)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/transfer_admin",
        vol.Required("group_id"): cv.string,
        vol.Required("member_id"): cv.string,
    }
)
@websocket_api.async_response
@api_command(Scope.GROUP, Requires.ADMIN)
async def websocket_transfer_admin(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Hand the group to another member, who becomes its admin.

    Scoped on the group rather than the member: the question is who runs this
    group, and only whoever runs it may answer it.
    """

    await manager.transfer_admin(msg["group_id"], msg["member_id"])

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
    websocket_transfer_admin,
    websocket_get_balances,
)
