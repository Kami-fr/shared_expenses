"""Shared plumbing for the WebSocket API."""

from __future__ import annotations

from collections.abc import Callable, Coroutine, Sequence
from datetime import UTC, datetime
from functools import wraps
from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.util import dt as dt_util
import voluptuous as vol

from ..const import DOMAIN
from ..exceptions import (
    CategoryNotFoundError,
    ExpenseNotFoundError,
    GroupArchivedError,
    GroupNotFoundError,
    InvalidExpenseError,
    InvalidExpenseSharesError,
    InvalidPaymentError,
    InvalidSplitRuleError,
    MemberAlreadyInGroupError,
    MemberNotFoundError,
    PaymentNotFoundError,
    SharedExpensesError,
)
from ..helpers.ids import new_id
from ..helpers.splits import rule_from_dict
from ..manager import SharedExpensesManager
from ..models import ExpenseShare, SplitRule

CommandHandler = Callable[
    [
        HomeAssistant,
        websocket_api.ActiveConnection,
        dict[str, Any],
        SharedExpensesManager,
    ],
    Coroutine[Any, Any, None],
]

ERROR_NOT_LOADED = "not_loaded"
ERROR_UNKNOWN = "unknown_error"

# Error codes are part of the contract with the frontend: they are declared
# here rather than derived from the class names, so that they survive a rename.
ERROR_CODES: dict[type[SharedExpensesError], str] = {
    GroupNotFoundError: "group_not_found",
    GroupArchivedError: "group_archived",
    MemberNotFoundError: "member_not_found",
    MemberAlreadyInGroupError: "member_already_in_group",
    CategoryNotFoundError: "category_not_found",
    ExpenseNotFoundError: "expense_not_found",
    InvalidExpenseError: "invalid_expense",
    InvalidExpenseSharesError: "invalid_expense_shares",
    InvalidSplitRuleError: "invalid_split_rule",
    PaymentNotFoundError: "payment_not_found",
    InvalidPaymentError: "invalid_payment",
}

SHARE_SCHEMA = vol.Schema(
    {
        vol.Required("member_id"): cv.string,
        vol.Required("amount"): int,
    }
)

SPLIT_RULE_SCHEMA = vol.Schema(
    {
        vol.Optional("participants"): vol.Any(None, [cv.string]),
        vol.Optional("fixed"): {cv.string: int},
        vol.Optional("cap"): vol.Any(None, int),
        vol.Optional("remainder"): cv.string,
    }
)


def api_command(func: CommandHandler) -> websocket_api.AsyncWebSocketCommandHandler:
    """Resolve the manager and turn business errors into WebSocket errors."""

    @wraps(func)
    async def handler(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        """Handle a command."""

        manager = _get_manager(hass)

        if manager is None:
            connection.send_error(
                msg["id"],
                ERROR_NOT_LOADED,
                "The Shared Expenses integration is not loaded.",
            )
            return

        try:
            await func(hass, connection, msg, manager)
        except SharedExpensesError as err:
            connection.send_error(msg["id"], error_code(err), _message(err))

    return handler


def error_code(err: SharedExpensesError) -> str:
    """Return the frontend error code of a business error."""

    for error_type, code in ERROR_CODES.items():
        if type(err) is error_type:
            return code

    return ERROR_UNKNOWN


def as_utc(value: datetime) -> datetime:
    """Return a timezone-aware UTC datetime."""

    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)

    return dt_util.as_utc(value)


def split_rule_from_msg(msg: dict[str, Any]) -> SplitRule | None:
    """Return the split rule carried by a message, when there is one."""

    return rule_from_dict(msg.get("split_rule"))


def shares_from_msg(msg: dict[str, Any]) -> list[ExpenseShare] | None:
    """Return the explicit shares carried by a message, when there are any.

    The identifiers are placeholders: the manager builds the stored shares.
    """

    payload: Sequence[dict[str, Any]] | None = msg.get("shares")

    if payload is None:
        return None

    now = datetime.now(UTC)

    return [
        ExpenseShare(
            id=new_id(),
            expense_id="",
            member_id=share["member_id"],
            amount=share["amount"],
            created_at=now,
        )
        for share in payload
    ]


def _get_manager(hass: HomeAssistant) -> SharedExpensesManager | None:
    """Return the manager of the config entry.

    The integration declares `single_config_entry`, so there is at most one.
    """

    entries: dict[str, SharedExpensesManager] = hass.data.get(DOMAIN, {})

    if not entries:
        return None

    return next(iter(entries.values()))


def _message(err: SharedExpensesError) -> str:
    """Return a readable message for a business error."""

    return str(err) or type(err).__name__
