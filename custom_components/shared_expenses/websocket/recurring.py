"""WebSocket commands for recurring expenses."""

from __future__ import annotations

from datetime import date
from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.util import dt as dt_util
import voluptuous as vol

from ..helpers.splits import rule_from_dict
from ..manager import SharedExpensesManager
from ..models import RecurrenceUnit
from .api import (
    SHARE_SCHEMA,
    SPLIT_RULE_SCHEMA,
    Requires,
    Scope,
    api_command,
    as_utc,
    shares_from_msg,
    split_rule_from_msg,
)
from .serializers import expense_to_dict, recurring_to_dict

UNIT = vol.In([str(unit) for unit in RecurrenceUnit])


def _today() -> date:
    """Today, in the house's own time zone: the day a rent falls due on."""

    return dt_util.now().date()


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/list_recurring",
        vol.Required("group_id"): cv.string,
    }
)
@websocket_api.async_response
@api_command(Scope.GROUP)
async def websocket_list_recurring(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Return the recurring expenses of a group, each with what is waiting."""

    recurring = await manager.list_recurring(msg["group_id"])
    latest = await manager.latest_occurrences(msg["group_id"])
    today = _today()

    connection.send_result(
        msg["id"],
        [recurring_to_dict(item, today, latest.get(item.id)) for item in recurring],
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/create_recurring",
        vol.Required("group_id"): cv.string,
        vol.Required("title"): cv.string,
        vol.Required("amount"): int,
        vol.Required("paid_by_member_id"): cv.string,
        vol.Required("expense_date"): cv.datetime,
        vol.Required("every"): vol.All(int, vol.Range(min=1)),
        vol.Required("unit"): UNIT,
        vol.Optional("ends_on"): vol.Any(None, cv.date),
        vol.Optional("currency"): vol.Any(None, cv.string),
        vol.Optional("category_id"): vol.Any(None, cv.string),
        vol.Optional("description"): vol.Any(None, cv.string),
        vol.Optional("shares"): [SHARE_SCHEMA],
        vol.Optional("split_rule"): vol.Any(None, SPLIT_RULE_SCHEMA),
        # The rule each occurrence is proposed with. Null, the usual case, means
        # nobody touched the split: the category's rule and then the group's are
        # read afresh at every confirmation.
        vol.Optional("rule"): vol.Any(None, SPLIT_RULE_SCHEMA),
        vol.Optional("exchange_rate"): int,
    }
)
@websocket_api.async_response
@api_command(Scope.GROUP)
async def websocket_create_recurring(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Set up a recurring expense, adding the expense typed as its first occurrence.

    Everything an expense takes, for that first one, and the rhythm. Answers
    with both, since the panel shows both.
    """

    recurring, expense = await manager.create_recurring(
        group_id=msg["group_id"],
        title=msg["title"],
        amount=msg["amount"],
        paid_by_member_id=msg["paid_by_member_id"],
        expense_date=as_utc(msg["expense_date"]),
        every=msg["every"],
        unit=RecurrenceUnit(msg["unit"]),
        ends_on=msg.get("ends_on"),
        currency=msg.get("currency"),
        category_id=msg.get("category_id"),
        description=msg.get("description"),
        shares=shares_from_msg(msg),
        split_rule=split_rule_from_msg(msg),
        rule=rule_from_dict(msg.get("rule")),
        exchange_rate=msg.get("exchange_rate"),
        actor_user_id=connection.user.id,
    )

    shares = await manager.get_expense_shares(expense.id)

    connection.send_result(
        msg["id"],
        {
            "recurring": recurring_to_dict(recurring, _today(), expense),
            "expense": expense_to_dict(expense, shares),
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/update_recurring",
        vol.Required("recurring_id"): cv.string,
        vol.Optional("title"): cv.string,
        vol.Optional("description"): vol.Any(None, cv.string),
        vol.Optional("amount"): int,
        vol.Optional("currency"): cv.string,
        vol.Optional("paid_by_member_id"): cv.string,
        vol.Optional("category_id"): vol.Any(None, cv.string),
        vol.Optional("split_rule"): vol.Any(None, SPLIT_RULE_SCHEMA),
        vol.Optional("every"): vol.All(int, vol.Range(min=1)),
        vol.Optional("unit"): UNIT,
        # The day the next occurrence falls on. Moving it moves every later one
        # with it: it becomes the day the rhythm counts from.
        vol.Optional("next_due"): cv.date,
        vol.Optional("ends_on"): vol.Any(None, cv.date),
        vol.Optional("paused"): bool,
    }
)
@websocket_api.async_response
@api_command(Scope.RECURRING, Requires.MINE)
async def websocket_update_recurring(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Change a recurring expense. Only the supplied fields change."""

    changes: dict[str, Any] = {
        key: msg[key]
        for key in (
            "title",
            "description",
            "amount",
            "currency",
            "paid_by_member_id",
            "category_id",
            "every",
            "next_due",
            "ends_on",
            "paused",
        )
        if key in msg
    }

    if "unit" in msg:
        changes["unit"] = RecurrenceUnit(msg["unit"])

    if "split_rule" in msg:
        changes["split_rule"] = split_rule_from_msg(msg)

    recurring = await manager.update_recurring(
        msg["recurring_id"],
        today=_today(),
        changes=changes,
        actor_user_id=connection.user.id,
    )

    latest = await manager.latest_occurrences(recurring.group_id)

    connection.send_result(
        msg["id"],
        recurring_to_dict(recurring, _today(), latest.get(recurring.id)),
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/delete_recurring",
        vol.Required("recurring_id"): cv.string,
    }
)
@websocket_api.async_response
@api_command(Scope.RECURRING, Requires.MINE)
async def websocket_delete_recurring(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Stop a recurring expense. What it already added stays."""

    await manager.delete_recurring(
        msg["recurring_id"],
        actor_user_id=connection.user.id,
    )

    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/skip_occurrence",
        vol.Required("recurring_id"): cv.string,
        vol.Required("occurrence"): cv.date,
    }
)
@websocket_api.async_response
@api_command(Scope.RECURRING)
async def websocket_skip_occurrence(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Pass over the occurrence waiting. Any member may, as any member may confirm."""

    recurring = await manager.skip_occurrence(
        msg["recurring_id"],
        msg["occurrence"],
        actor_user_id=connection.user.id,
    )

    latest = await manager.latest_occurrences(recurring.group_id)

    connection.send_result(
        msg["id"],
        recurring_to_dict(recurring, _today(), latest.get(recurring.id)),
    )


COMMANDS = (
    websocket_list_recurring,
    websocket_create_recurring,
    websocket_update_recurring,
    websocket_delete_recurring,
    websocket_skip_occurrence,
)
