"""Shared plumbing for the WebSocket API."""

from __future__ import annotations

from collections.abc import Callable, Coroutine, Sequence
from datetime import UTC, datetime
from enum import Enum
from functools import wraps
from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.util import dt as dt_util
import voluptuous as vol

from ..const import DOMAIN
from ..exceptions import (
    AdminNeedsAccountError,
    CannotRemoveAdminError,
    CategoryNotFoundError,
    CurrencyLockedError,
    ExchangeRateUnavailableError,
    ExpenseNotFoundError,
    GroupArchivedError,
    GroupNotFoundError,
    InvalidExchangeRateError,
    InvalidExpenseError,
    InvalidExpenseSharesError,
    InvalidPaymentError,
    InvalidSplitRuleError,
    MemberAlreadyInGroupError,
    MemberNotFoundError,
    NotAllowedError,
    PaymentNotFoundError,
    SharedExpensesError,
)
from ..helpers.ids import new_id
from ..helpers.splits import rule_from_dict
from ..manager import SharedExpensesManager
from ..models import ExpenseShare, Permission, SplitRule

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


class Scope(Enum):
    """What a command reaches for, and therefore what to check before running.

    Each value names the field carrying the identifier: the caller must be an
    active member of the group that identifier belongs to.
    """

    NONE = "none"
    """Reaches nothing group-bound. The caller only has to be logged in."""

    GROUP = "group_id"
    MEMBER = "member_id"
    EXPENSE = "expense_id"
    CATEGORY = "category_id"
    PAYMENT = "payment_id"


class Requires(Enum):
    """What a command asks of the caller, beyond being in the group.

    Stated by the command and enforced here, for the same reason the scope is:
    a rule each handler had to remember to apply is a rule one of them will
    forget. `None` is the explicit way out and means every member may do it.
    """

    ADMIN = "admin"
    """Nobody but the group's admin. For what no switch will ever cover."""

    MINE = "mine"
    """Theirs, or the group's leave to touch what is not.

    Only meaningful on an EXPENSE or a PAYMENT scope: what counts as theirs is
    the thing's own business, and the manager is where it is decided.
    """

# Error codes are part of the contract with the frontend: they are declared
# here rather than derived from the class names, so that they survive a rename.
ERROR_CODES: dict[type[SharedExpensesError], str] = {
    GroupNotFoundError: "group_not_found",
    GroupArchivedError: "group_archived",
    MemberNotFoundError: "member_not_found",
    MemberAlreadyInGroupError: "member_already_in_group",
    CannotRemoveAdminError: "cannot_remove_admin",
    AdminNeedsAccountError: "admin_needs_account",
    NotAllowedError: "not_allowed",
    CategoryNotFoundError: "category_not_found",
    ExpenseNotFoundError: "expense_not_found",
    InvalidExpenseError: "invalid_expense",
    InvalidExpenseSharesError: "invalid_expense_shares",
    InvalidSplitRuleError: "invalid_split_rule",
    PaymentNotFoundError: "payment_not_found",
    InvalidPaymentError: "invalid_payment",
    InvalidExchangeRateError: "invalid_exchange_rate",
    ExchangeRateUnavailableError: "exchange_rate_unavailable",
    CurrencyLockedError: "currency_locked",
}

SHARE_SCHEMA = vol.Schema(
    {
        vol.Required("member_id"): cv.string,
        vol.Required("amount"): int,
    }
)

REMAINDER_SCHEMA = vol.Schema(
    {
        vol.Optional("members"): vol.Any(None, [cv.string]),
        vol.Optional("fixed"): {cv.string: int},
        # In hundredths of a percent: 60% is 6000. Kept in step with
        # `Remainder` and with `REMAINDER_KEYS` in helpers/splits.py — this
        # schema is the door, and a field the model knows but the door does not
        # is a field nobody can send.
        vol.Optional("percent"): {cv.string: int},
    }
)

SPLIT_RULE_SCHEMA = vol.Schema(
    {
        # `None` means the whole expense is shared equally.
        vol.Optional("envelope"): vol.Any(None, int),
        vol.Optional("participants"): vol.Any(None, [cv.string]),
        vol.Optional("remainder"): REMAINDER_SCHEMA,
    }
)


def api_command(
    scope: Scope,
    requires: Requires | Permission | None = None,
) -> Callable[[CommandHandler], websocket_api.AsyncWebSocketCommandHandler]:
    """Resolve the manager, authorize the caller, and map business errors.

    Every command states what it reaches for and what it asks of the caller, so
    that walling the panel off is a property of this decorator rather than of
    each handler remembering to check. `Scope.NONE` is the explicit way out, not
    the default; `requires=None` says every member of the group may do this.

    Two different questions, deliberately kept apart. The scope asks whether the
    caller may see the thing at all, and answers by pretending it does not exist
    — hiding is the only honest answer to somebody who must not know. `requires`
    asks whether they may do this to a thing they are already looking at, and
    says so plainly.
    """

    def decorate(func: CommandHandler) -> websocket_api.AsyncWebSocketCommandHandler:
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
                await _authorize(manager, connection, msg, scope, requires)

                await func(hass, connection, msg, manager)
            except SharedExpensesError as err:
                connection.send_error(msg["id"], error_code(err), _message(err))

        return handler

    return decorate


async def _authorize(
    manager: SharedExpensesManager,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    scope: Scope,
    requires: Requires | Permission | None = None,
) -> None:
    """Refuse a caller reaching outside the groups they belong to, or overreaching.

    Every refusal of the first kind wears the not-found error of the thing asked
    for: telling "exists but not yours" apart from "does not exist" would leak
    it. A refusal of the second kind says what it is: the caller can see the
    thing, so there is nothing left to hide, and an unexplained failure would
    only make the panel look broken.
    """

    if scope is Scope.NONE:
        return

    user_id = connection.user.id

    if scope is Scope.GROUP:
        await manager.ensure_group_member(msg["group_id"], user_id)
        await _require(manager, msg["group_id"], user_id, requires)
        return

    if scope is Scope.MEMBER:
        await manager.ensure_shares_group(msg["member_id"], user_id)

        # A member is reachable from every group they share with the caller, so
        # there is no one group to ask about. Whoever needs a permission here
        # carries the group in the message and says so.
        if requires is not None and "group_id" in msg:
            await _require(manager, msg["group_id"], user_id, requires)

        return

    if scope is Scope.EXPENSE:
        expense = await manager.get_expense(msg["expense_id"])

        try:
            await manager.ensure_group_member(expense.group_id, user_id)
        except GroupNotFoundError as err:
            raise ExpenseNotFoundError(msg["expense_id"]) from err

        if requires is Requires.MINE:
            await manager.ensure_may_edit_expense(expense, user_id)
        else:
            await _require(manager, expense.group_id, user_id, requires)

        return

    if scope is Scope.CATEGORY:
        category = await manager.get_category(msg["category_id"])

        try:
            await manager.ensure_group_member(category.group_id, user_id)
        except GroupNotFoundError as err:
            raise CategoryNotFoundError(msg["category_id"]) from err

        await _require(manager, category.group_id, user_id, requires)

        return

    if scope is Scope.PAYMENT:
        payment = await manager.get_payment(msg["payment_id"])

        try:
            await manager.ensure_group_member(payment.group_id, user_id)
        except GroupNotFoundError as err:
            raise PaymentNotFoundError(msg["payment_id"]) from err

        if requires is Requires.MINE:
            await manager.ensure_may_edit_payment(payment, user_id)
        else:
            await _require(manager, payment.group_id, user_id, requires)

        return

    raise RuntimeError(f"Unhandled authorization scope: {scope}")


async def _require(
    manager: SharedExpensesManager,
    group_id: str,
    user_id: str,
    requires: Requires | Permission | None,
) -> None:
    """Apply what a command asks of the caller within one group."""

    if requires is None:
        return

    if requires is Requires.ADMIN:
        await manager.ensure_admin(group_id, user_id)
        return

    if requires is Requires.MINE:
        raise RuntimeError(
            "Requires.MINE only means something on an expense or a payment: "
            "nothing else here is anybody's."
        )

    await manager.ensure_permission(group_id, user_id, requires)


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


#: What a group may be told to allow. The values, not the names: this is the
#: contract with the panel, and it survives a rename of the enum.
PERMISSIONS_SCHEMA = vol.Schema([vol.In([str(value) for value in Permission])])


def permissions_from_msg(msg: dict[str, Any]) -> frozenset[Permission]:
    """Read the permissions a message grants.

    The whole set every time, never a delta: a switch turned off has to arrive
    as an absence, and "not mentioned" and "taken away" cannot be the same
    thing in a message that only lists what is granted.
    """

    return frozenset(Permission(value) for value in msg["permissions"])


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

    entries: dict[str, dict[str, Any]] = hass.data.get(DOMAIN, {})

    if not entries:
        return None

    return next(iter(entries.values()))["manager"]


def _message(err: SharedExpensesError) -> str:
    """Return a readable message for a business error."""

    return str(err) or type(err).__name__
