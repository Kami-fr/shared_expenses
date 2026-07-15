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
from ..models import GroupRole, Permission
from .api import Scope, api_command
from .serializers import group_member_to_dict, member_to_dict


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/list_members",
        # Required since the walling off: listing every member of the house
        # would leak the people of groups the caller has nothing to do with.
        vol.Required("group_id"): cv.string,
        vol.Optional("include_left", default=False): bool,
    }
)
@websocket_api.async_response
@api_command(Scope.GROUP)
async def websocket_list_members(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Return the members of a group."""

    members = await manager.list_group_members(
        msg["group_id"],
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
@api_command(Scope.GROUP)
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
        # A member is always created into a group: a floating one serves nobody
        # and would sit outside the walling off.
        vol.Required("group_id"): cv.string,
        vol.Optional("user_id"): vol.Any(None, cv.string),
        vol.Optional("color"): vol.Any(None, cv.string),
        vol.Optional("role", default=GroupRole.MEMBER.value): vol.In(
            [role.value for role in GroupRole]
        ),
    }
)
@websocket_api.async_response
@api_command(Scope.GROUP, Permission.MANAGE_MEMBERS)
async def websocket_create_member(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Add someone to a group.

    With a `user_id`, this attaches the Home Assistant account, reusing the
    member it already has elsewhere rather than creating a second one. Without,
    it creates someone who has no account and will never log in.
    """

    group_id = msg["group_id"]
    role = GroupRole(msg["role"])

    await manager.ensure_may_grant_role(group_id, connection.user.id, role)

    if (user_id := msg.get("user_id")) is None:
        member = await manager.create_group_member(
            group_id=group_id,
            name=msg["name"],
            color=msg.get("color"),
            role=role,
        )
    else:
        member = await manager.link_user(user_id=user_id, name=msg["name"])

        if not any(
            m.member_id == member.id and m.left_at is None
            for m in await manager.list_group_memberships(group_id)
        ):
            await manager.add_member_to_group(
                group_id=group_id,
                member_id=member.id,
                role=role,
            )

    connection.send_result(msg["id"], member_to_dict(member))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/update_member",
        vol.Required("member_id"): cv.string,
        # Which group is asking. Required, not optional: a guard that can be
        # skipped by leaving a field out is not a guard.
        vol.Required("group_id"): cv.string,
        vol.Optional("name"): cv.string,
        vol.Optional("color"): vol.Any(None, cv.string),
    }
)
@websocket_api.async_response
@api_command(Scope.MEMBER)
async def websocket_update_member(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Update a member. Only the supplied fields change.

    A member is global — one per Home Assistant account, across every group —
    so a rename is felt everywhere. There is no per-group answer to who may do
    it; the group asking is the one whose leave is needed, and reaching it at
    all already means sharing a group with them.
    """

    await manager.ensure_may_edit_member(
        msg["group_id"],
        msg["member_id"],
        connection.user.id,
    )

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
@api_command(Scope.GROUP, Permission.MANAGE_MEMBERS)
async def websocket_add_member_to_group(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Add an existing member to a group."""

    role = GroupRole(msg["role"])

    await manager.ensure_may_grant_role(msg["group_id"], connection.user.id, role)

    membership = await manager.add_member_to_group(
        group_id=msg["group_id"],
        member_id=msg["member_id"],
        role=role,
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
@api_command(Scope.GROUP)
async def websocket_remove_member_from_group(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Mark a member as having left a group.

    The membership is kept so that past expenses stay attributable.
    """

    await manager.ensure_may_edit_member(
        msg["group_id"],
        msg["member_id"],
        connection.user.id,
    )

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


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/list_ha_users",
    }
)
@websocket_api.async_response
@api_command(Scope.NONE)
async def websocket_list_ha_users(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Return the Home Assistant accounts a group can be built from.

    Home Assistant's own `config/auth/list` is admin only, but an ordinary
    member has to compose their group, so this deliberately answers anyone
    logged in. It exposes the names of the household accounts, and nothing else.
    """

    users = await hass.auth.async_get_users()

    connection.send_result(
        msg["id"],
        [
            {
                "id": user.id,
                "name": user.name,
                "is_owner": user.is_owner,
                # Whether this account already has a member, so the panel can
                # tell an account to attach from one already in the house.
                "member_id": getattr(
                    await manager.get_member_for_user(user.id), "id", None
                ),
            }
            for user in users
            # Skip Home Assistant's own machinery: those are not people.
            if user.is_active and not user.system_generated
        ],
    )


COMMANDS = (
    websocket_list_ha_users,
    websocket_list_members,
    websocket_list_memberships,
    websocket_create_member,
    websocket_update_member,
    websocket_add_member_to_group,
    websocket_remove_member_from_group,
)
