"""WebSocket commands for payments."""

from __future__ import annotations

from dataclasses import replace
from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
import voluptuous as vol

from ..manager import SharedExpensesManager
from ..models import PaymentKind, RevisionEntity
from .api import Requires, Scope, api_command, as_utc
from .serializers import payment_to_dict


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/list_payments",
        vol.Required("group_id"): cv.string,
    }
)
@websocket_api.async_response
@api_command(Scope.GROUP)
async def websocket_list_payments(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Return the payments of a group."""

    payments = await manager.list_payments(msg["group_id"])

    connection.send_result(
        msg["id"],
        [payment_to_dict(payment) for payment in payments],
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/create_payment",
        vol.Required("group_id"): cv.string,
        vol.Required("from_member_id"): cv.string,
        vol.Required("to_member_id"): cv.string,
        vol.Required("amount"): int,
        vol.Required("payment_date"): cv.datetime,
        vol.Optional("description"): vol.Any(None, cv.string),
        vol.Optional("kind"): vol.In([str(k) for k in PaymentKind]),
        vol.Optional("currency"): vol.Any(None, cv.string),
        # In millionths. Sent when the panel has shown a rate and had it
        # accepted; left out, the manager finds one itself.
        vol.Optional("exchange_rate"): int,
        # What it was about, when it was about one expense.
        vol.Optional("expense_id"): vol.Any(None, cv.string),
    }
)
@websocket_api.async_response
@api_command(Scope.GROUP)
async def websocket_create_payment(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Create a payment from one member to another."""

    payment = await manager.create_payment(
        group_id=msg["group_id"],
        from_member_id=msg["from_member_id"],
        to_member_id=msg["to_member_id"],
        amount=msg["amount"],
        payment_date=as_utc(msg["payment_date"]),
        description=msg.get("description"),
        currency=msg.get("currency"),
        exchange_rate=msg.get("exchange_rate"),
        kind=PaymentKind(msg.get("kind", PaymentKind.REIMBURSEMENT)),
        expense_id=msg.get("expense_id"),
        actor_user_id=connection.user.id,
    )

    connection.send_result(msg["id"], payment_to_dict(payment))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/update_payment",
        vol.Required("payment_id"): cv.string,
        vol.Optional("from_member_id"): cv.string,
        vol.Optional("to_member_id"): cv.string,
        vol.Optional("amount"): int,
        vol.Optional("payment_date"): cv.datetime,
        vol.Optional("description"): vol.Any(None, cv.string),
        vol.Optional("kind"): vol.In([str(k) for k in PaymentKind]),
        vol.Optional("currency"): cv.string,
        vol.Optional("exchange_rate"): int,
        # Null on purpose rather than merely absent: absent means "leave it
        # alone", and taking the link off has to be sayable.
        vol.Optional("expense_id"): vol.Any(None, cv.string),
    }
)
@websocket_api.async_response
@api_command(Scope.PAYMENT, Requires.MINE)
async def websocket_update_payment(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Update a payment. Only the supplied fields change."""

    payment = await manager.get_payment(msg["payment_id"])

    changes: dict[str, Any] = {
        field: msg[field]
        for field in (
            "from_member_id",
            "to_member_id",
            "amount",
            "currency",
            "description",
            "expense_id",
        )
        if field in msg
    }

    if "payment_date" in msg:
        changes["payment_date"] = as_utc(msg["payment_date"])

    if "kind" in msg:
        changes["kind"] = PaymentKind(msg["kind"])

    updated = replace(payment, **changes)

    await manager.update_payment(
        updated,
        exchange_rate=msg.get("exchange_rate"),
        actor_user_id=connection.user.id,
    )

    connection.send_result(msg["id"], payment_to_dict(updated))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/delete_payment",
        vol.Required("payment_id"): cv.string,
    }
)
@websocket_api.async_response
@api_command(Scope.PAYMENT, Requires.MINE)
async def websocket_delete_payment(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Delete a payment."""

    await manager.delete_payment(
        msg["payment_id"],
        actor_user_id=connection.user.id,
    )

    connection.send_result(msg["id"], None)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/restore_payment",
        vol.Required("group_id"): cv.string,
        vol.Required("payment_id"): cv.string,
    }
)
@websocket_api.async_response
@api_command(Scope.GROUP)
async def websocket_restore_payment(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Bring a deleted payment back. See `websocket_restore_expense`."""

    await manager.ensure_may_restore(
        msg["group_id"],
        msg["payment_id"],
        RevisionEntity.PAYMENT,
        connection.user.id,
    )

    restored = await manager.restore_payment(
        msg["group_id"],
        msg["payment_id"],
        actor_user_id=connection.user.id,
    )

    connection.send_result(msg["id"], payment_to_dict(restored))


COMMANDS = (
    websocket_list_payments,
    websocket_create_payment,
    websocket_update_payment,
    websocket_restore_payment,
    websocket_delete_payment,
)
