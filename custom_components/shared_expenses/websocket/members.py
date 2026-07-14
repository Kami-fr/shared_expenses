"""WebSocket commands for members."""

from __future__ import annotations

from dataclasses import replace
from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
import voluptuous as vol

from ..exceptions import MemberNotFoundError
from ..manager import SharedExpensesManager
from ..models import GroupRole
from .api import api_command
from .serializers import group_member_to_dict, member_to_dict


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/list_members",
        vol.Optional("group_id"): cv.string,
        vol.Optional("include_left", default=False): bool,
    }
)
@websocket_api.async_response
@api_command
async def websocket_list_members(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Return the members of a group, or every member."""

    if (group_id := msg.get("group_id")) is None:
        members = await manager.list_members()
    else:
        members = await manager.list_group_members(
            group_id,
            include_left=msg["include_left"],
        )

    connection.send_result(msg["id"], [member_to_dict(member) for member in members])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/list_memberships",
        vol.Required("group_id"): cv.string,
    }
)
@websocket_api.async_response
@api_command
async def websocket_list_memberships(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Return the memberships of a group, past ones included."""

    memberships = await manager.list_group_memberships(msg["group_id"])

    connection.send_result(
        msg["id"],
        [group_member_to_dict(membership) for membership in memberships],
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/create_member",
        vol.Required("name"): cv.string,
        vol.Optional("group_id"): cv.string,
        vol.Optional("user_id"): vol.Any(None, cv.string),
        vol.Optional("color"): vol.Any(None, cv.string),
        vol.Optional("role", default=GroupRole.MEMBER.value): vol.In(
            [role.value for role in GroupRole]
        ),
    }
)
@websocket_api.async_response
@api_command
async def websocket_create_member(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Create a member, and add it to a group when one is given."""

    if (group_id := msg.get("group_id")) is None:
        member = await manager.create_member(
            name=msg["name"],
            user_id=msg.get("user_id"),
            color=msg.get("color"),
        )
    else:
        member = await manager.create_group_member(
            group_id=group_id,
            name=msg["name"],
            user_id=msg.get("user_id"),
            color=msg.get("color"),
            role=GroupRole(msg["role"]),
        )

    connection.send_result(msg["id"], member_to_dict(member))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/update_member",
        vol.Required("member_id"): cv.string,
        vol.Optional("name"): cv.string,
        vol.Optional("color"): vol.Any(None, cv.string),
    }
)
@websocket_api.async_response
@api_command
async def websocket_update_member(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Update a member. Only the supplied fields change."""

    member = await manager.get_member(msg["member_id"])

    updated = replace(
        member,
        **{field: msg[field] for field in ("name", "color") if field in msg},
    )

    await manager.update_member(updated)

    connection.send_result(msg["id"], member_to_dict(updated))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/add_member_to_group",
        vol.Required("group_id"): cv.string,
        vol.Required("member_id"): cv.string,
        vol.Optional("role", default=GroupRole.MEMBER.value): vol.In(
            [role.value for role in GroupRole]
        ),
    }
)
@websocket_api.async_response
@api_command
async def websocket_add_member_to_group(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Add an existing member to a group."""

    membership = await manager.add_member_to_group(
        group_id=msg["group_id"],
        member_id=msg["member_id"],
        role=GroupRole(msg["role"]),
    )

    connection.send_result(msg["id"], group_member_to_dict(membership))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/remove_member_from_group",
        vol.Required("group_id"): cv.string,
        vol.Required("member_id"): cv.string,
    }
)
@websocket_api.async_response
@api_command
async def websocket_remove_member_from_group(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Mark a member as having left a group.

    The membership is kept so that past expenses stay attributable.
    """

    memberships = await manager.list_group_memberships(msg["group_id"])

    membership = next(
        (
            candidate
            for candidate in memberships
            if candidate.member_id == msg["member_id"] and candidate.left_at is None
        ),
        None,
    )

    if membership is None:
        raise MemberNotFoundError(msg["member_id"])

    await manager.remove_member_from_group(membership)

    connection.send_result(msg["id"], None)


COMMANDS = (
    websocket_list_members,
    websocket_list_memberships,
    websocket_create_member,
    websocket_update_member,
    websocket_add_member_to_group,
    websocket_remove_member_from_group,
)
