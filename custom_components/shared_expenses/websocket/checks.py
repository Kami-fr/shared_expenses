"""WebSocket commands for checking a group's expenses for typing slips.

What looks wrong is worked out by the panel, from the expenses it already
holds. The backend keeps the two things the panel cannot: which alerts a
member answered "this is right", and the correction itself, written to
several expenses at once.
"""

from __future__ import annotations

from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
import voluptuous as vol

from ..manager import SharedExpensesManager
from .api import Scope, api_command
from .serializers import expense_to_dict

CHECK_KIND = vol.In(["amount", "names", "duplicate", "category"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/list_check_dismissals",
        vol.Required("group_id"): cv.string,
    }
)
@websocket_api.async_response
@api_command(Scope.GROUP)
async def websocket_list_check_dismissals(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Return the checks answered "this is right" in a group."""

    dismissed = await manager.list_check_dismissals(msg["group_id"])

    connection.send_result(
        msg["id"],
        [{"kind": kind, "key": key} for kind, key in dismissed],
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/dismiss_check",
        vol.Required("group_id"): cv.string,
        vol.Required("kind"): CHECK_KIND,
        vol.Required("key"): vol.All(cv.string, vol.Length(min=1, max=4000)),
    }
)
@websocket_api.async_response
@api_command(Scope.GROUP)
async def websocket_dismiss_check(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Answer a check "this is right". Any member may: it changes no money."""

    await manager.dismiss_check(
        msg["group_id"],
        msg["kind"],
        msg["key"],
        actor_user_id=connection.user.id,
    )

    connection.send_result(msg["id"], None)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/correct_expenses",
        vol.Required("group_id"): cv.string,
        vol.Required("expense_ids"): vol.All([cv.string], vol.Length(min=1, max=1000)),
        vol.Exclusive("title", "correction"): cv.string,
        vol.Exclusive("category_id", "correction"): vol.Any(None, cv.string),
        vol.Exclusive("amount", "correction"): int,
    }
)
@websocket_api.async_response
@api_command(Scope.GROUP)
async def websocket_correct_expenses(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Set one field right on several expenses of the group.

    Each expense is the caller's to change, as if they opened it: theirs, or
    the group's leave to change what is not. One refusal refuses the lot,
    before anything is written.
    """

    user_id = connection.user.id

    for expense_id in msg["expense_ids"]:
        expense = await manager.get_expense(expense_id)

        # Somebody else's group's expense does not exist, as everywhere else.
        if expense.group_id == msg["group_id"]:
            await manager.ensure_may_edit_expense(expense, user_id)

    corrected = await manager.correct_expenses(
        msg["group_id"],
        msg["expense_ids"],
        {
            field: msg[field]
            for field in ("title", "category_id", "amount")
            if field in msg
        },
        actor_user_id=user_id,
    )

    connection.send_result(
        msg["id"], [expense_to_dict(expense) for expense in corrected]
    )


COMMANDS = (
    websocket_list_check_dismissals,
    websocket_dismiss_check,
    websocket_correct_expenses,
)
