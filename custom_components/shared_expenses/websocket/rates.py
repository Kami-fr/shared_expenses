"""WebSocket commands for exchange rates."""

from __future__ import annotations

from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
import voluptuous as vol

from ..exceptions import ExchangeRateUnavailableError
from ..manager import SharedExpensesManager
from .api import Scope, api_command
from .serializers import rate_to_dict

#: A currency code, as the ECB writes them.
CURRENCY = vol.All(cv.string, vol.Length(min=3, max=3))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/get_exchange_rate",
        # Scoped on a group so the wall applies: rates are public knowledge,
        # but who is asking and how often is not.
        vol.Required("group_id"): cv.string,
        vol.Required("base"): CURRENCY,
        vol.Required("quote"): CURRENCY,
        vol.Required("on"): cv.date,
    }
)
@websocket_api.async_response
@api_command(Scope.GROUP)
async def websocket_get_exchange_rate(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Return the rate for a pair on a day.

    Answers with a rate whenever it can, from the source or from what is
    cached, and says which day it is really from — a Sunday carries Friday's.
    The one refusal is when nothing is known and nothing can be reached, and
    then the panel has to ask for one by hand.
    """

    rate = await manager.get_exchange_rate(
        base=msg["base"],
        quote=msg["quote"],
        on=msg["on"],
    )

    connection.send_result(msg["id"], rate_to_dict(rate, asked_for=msg["on"]))


@websocket_api.websocket_command(
    {
        vol.Required("type"): "shared_expenses/set_exchange_rate",
        vol.Required("group_id"): cv.string,
        vol.Required("base"): CURRENCY,
        vol.Required("quote"): CURRENCY,
        vol.Required("on"): cv.date,
        # In millionths, like everywhere else: 0.87681 is 876810. A float on
        # this wire would be a float in the balances.
        vol.Required("rate"): int,
    }
)
@websocket_api.async_response
@api_command(Scope.GROUP)
async def websocket_set_exchange_rate(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Record a rate somebody typed, and hand it back.

    It becomes the last known rate for that pair, so the next expense finds it
    even if the source is still down.
    """

    rate = await manager.set_exchange_rate(
        base=msg["base"],
        quote=msg["quote"],
        on=msg["on"],
        rate=msg["rate"],
    )

    connection.send_result(msg["id"], rate_to_dict(rate, asked_for=msg["on"]))


COMMANDS = (
    websocket_get_exchange_rate,
    websocket_set_exchange_rate,
)

__all__ = ["COMMANDS", "ExchangeRateUnavailableError"]
