"""WebSocket commands for expenses."""

from __future__ import annotations

from dataclasses import replace
from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
import voluptuous as vol

from ..manager import SharedExpensesManager
from .api import (
    SHARE_SCHEMA,
    SPLIT_RULE_SCHEMA,
    api_command,
    as_utc,
    shares_from_msg,
    split_rule_from_msg,
)
from .serializers import expense_to_dict, share_to_dict


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/list_expenses",
        vol.Required("group_id"): cv.string,
        vol.Optional("with_shares", default=True): bool,
    }
)
@websocket_api.async_response
@api_command
async def websocket_list_expenses(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Return the expenses of a group, with their shares by default."""

    expenses = await manager.list_expenses(msg["group_id"])

    if not msg["with_shares"]:
        connection.send_result(
            msg["id"],
            [expense_to_dict(expense) for expense in expenses],
        )
        return

    shares = await manager.list_expense_shares(msg["group_id"])

    by_expense: dict[str, list[Any]] = {}

    for share in shares:
        by_expense.setdefault(share.expense_id, []).append(share)

    connection.send_result(
        msg["id"],
        [
            expense_to_dict(expense, by_expense.get(expense.id, []))
            for expense in expenses
        ],
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/get_expense",
        vol.Required("expense_id"): cv.string,
    }
)
@websocket_api.async_response
@api_command
async def websocket_get_expense(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Return an expense with its shares."""

    expense = await manager.get_expense(msg["expense_id"])
    shares = await manager.get_expense_shares(expense.id)

    connection.send_result(msg["id"], expense_to_dict(expense, shares))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/create_expense",
        vol.Required("group_id"): cv.string,
        vol.Required("title"): cv.string,
        vol.Required("amount"): int,
        vol.Required("paid_by_member_id"): cv.string,
        vol.Required("expense_date"): cv.datetime,
        vol.Optional("currency"): vol.Any(None, cv.string),
        vol.Optional("category_id"): vol.Any(None, cv.string),
        vol.Optional("description"): vol.Any(None, cv.string),
        vol.Optional("shares"): [SHARE_SCHEMA],
        vol.Optional("split_rule"): vol.Any(None, SPLIT_RULE_SCHEMA),
    }
)
@websocket_api.async_response
@api_command
async def websocket_create_expense(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Create an expense.

    Send `shares` to set every share explicitly, `split_rule` to override the
    split for this expense only, or neither to apply the rule of the category
    then of the group.
    """

    expense = await manager.create_expense(
        group_id=msg["group_id"],
        title=msg["title"],
        amount=msg["amount"],
        paid_by_member_id=msg["paid_by_member_id"],
        expense_date=as_utc(msg["expense_date"]),
        currency=msg.get("currency"),
        category_id=msg.get("category_id"),
        description=msg.get("description"),
        shares=shares_from_msg(msg),
        split_rule=split_rule_from_msg(msg),
    )

    shares = await manager.get_expense_shares(expense.id)

    connection.send_result(msg["id"], expense_to_dict(expense, shares))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/update_expense",
        vol.Required("expense_id"): cv.string,
        vol.Optional("title"): cv.string,
        vol.Optional("amount"): int,
        vol.Optional("paid_by_member_id"): cv.string,
        vol.Optional("expense_date"): cv.datetime,
        vol.Optional("currency"): cv.string,
        vol.Optional("category_id"): vol.Any(None, cv.string),
        vol.Optional("description"): vol.Any(None, cv.string),
        vol.Optional("shares"): [SHARE_SCHEMA],
        vol.Optional("split_rule"): vol.Any(None, SPLIT_RULE_SCHEMA),
    }
)
@websocket_api.async_response
@api_command
async def websocket_update_expense(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Update an expense. Only the supplied fields change."""

    expense = await manager.get_expense(msg["expense_id"])

    changes: dict[str, Any] = {
        field: msg[field]
        for field in (
            "title",
            "amount",
            "paid_by_member_id",
            "currency",
            "category_id",
            "description",
        )
        if field in msg
    }

    if "expense_date" in msg:
        changes["expense_date"] = as_utc(msg["expense_date"])

    updated = replace(expense, **changes)

    # Without explicit shares nor an explicit rule, re-resolving the default
    # rule keeps the shares consistent with the new amount.
    await manager.update_expense(
        updated,
        shares_from_msg(msg),
        split_rule=split_rule_from_msg(msg),
    )

    shares = await manager.get_expense_shares(updated.id)

    connection.send_result(msg["id"], expense_to_dict(updated, shares))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/delete_expense",
        vol.Required("expense_id"): cv.string,
    }
)
@websocket_api.async_response
@api_command
async def websocket_delete_expense(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Delete an expense and its shares."""

    await manager.delete_expense(msg["expense_id"])

    connection.send_result(msg["id"], None)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/list_expense_shares",
        vol.Required("group_id"): cv.string,
    }
)
@websocket_api.async_response
@api_command
async def websocket_list_expense_shares(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Return the shares of every expense of a group."""

    shares = await manager.list_expense_shares(msg["group_id"])

    connection.send_result(msg["id"], [share_to_dict(share) for share in shares])


COMMANDS = (
    websocket_list_expenses,
    websocket_get_expense,
    websocket_create_expense,
    websocket_update_expense,
    websocket_delete_expense,
    websocket_list_expense_shares,
)
