"""WebSocket commands for payments."""

from __future__ import annotations

from dataclasses import replace
from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
import voluptuous as vol

from ..manager import SharedExpensesManager
from .api import api_command, as_utc
from .serializers import payment_to_dict


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/list_payments",
        vol.Required("group_id"): cv.string,
    }
)
@websocket_api.async_response
@api_command
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
    }
)
@websocket_api.async_response
@api_command
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
    }
)
@websocket_api.async_response
@api_command
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
        for field in ("from_member_id", "to_member_id", "amount", "description")
        if field in msg
    }

    if "payment_date" in msg:
        changes["payment_date"] = as_utc(msg["payment_date"])

    updated = replace(payment, **changes)

    await manager.update_payment(updated)

    connection.send_result(msg["id"], payment_to_dict(updated))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/delete_payment",
        vol.Required("payment_id"): cv.string,
    }
)
@websocket_api.async_response
@api_command
async def websocket_delete_payment(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Delete a payment."""

    await manager.delete_payment(msg["payment_id"])

    connection.send_result(msg["id"], None)


COMMANDS = (
    websocket_list_payments,
    websocket_create_payment,
    websocket_update_payment,
    websocket_delete_payment,
)
