"""Actions, for a dashboard button and for an automation.

A `button` entity cannot do this: it has no fields, so it could not say how much
or who. A service can, which is also what makes an NFC tag on the fridge worth
sticking there.

Who is asking, and what that costs
----------------------------------

An action called from the interface carries the account behind it —
`websocket_api` builds `Context(user_id=self.user.id)` — so every rule this
integration has applies exactly as it does in the panel.

An automation carries none. Home Assistant builds its trigger context with a
`parent_id` and no user, even when a person set the trigger off. There is
nobody to ask, so nothing is asked: the call goes through.

That was decided rather than discovered. Only an admin can write an automation,
and an admin can already read `.storage/shared_expenses.db` with a text editor —
the rules were never a wall against them, and ADR-013 says so. Refusing here
would buy nothing and cost the tag on the fridge.

It is not silent, either. The journal records the actor it was given, which is
nobody, and reads as "Someone added the expense" — the word already existed for
exactly this.
"""

from __future__ import annotations

from datetime import datetime

from homeassistant.core import HomeAssistant, ServiceCall, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.util import dt as dt_util
import voluptuous as vol

from .const import DOMAIN
from .manager import SharedExpensesManager

SERVICE_ADD_EXPENSE = "add_expense"
SERVICE_SETTLE_UP = "settle_up"

#: Amounts arrive as money and are held as cents, like everywhere else here.
_AMOUNT = vol.All(vol.Coerce(float), vol.Range(min=0, min_included=False))

ADD_EXPENSE_SCHEMA = vol.Schema(
    {
        vol.Required("group_id"): cv.string,
        vol.Required("title"): cv.string,
        vol.Required("amount"): _AMOUNT,
        vol.Required("paid_by_member_id"): cv.string,
        vol.Optional("expense_date"): cv.datetime,
        vol.Optional("currency"): cv.string,
        vol.Optional("category_id"): cv.string,
        vol.Optional("description"): cv.string,
    }
)

SETTLE_UP_SCHEMA = vol.Schema(
    {
        vol.Required("group_id"): cv.string,
        vol.Required("from_member_id"): cv.string,
        vol.Required("to_member_id"): cv.string,
        vol.Required("amount"): _AMOUNT,
        vol.Optional("payment_date"): cv.datetime,
        vol.Optional("currency"): cv.string,
        vol.Optional("description"): cv.string,
    }
)


@callback
def async_setup_services(hass: HomeAssistant) -> None:
    """Register the actions. Once per instance, not once per entry."""

    async def _add_expense(call: ServiceCall) -> None:
        """Add an expense to a project."""

        manager = _manager(hass)
        actor = call.context.user_id

        if actor is not None:
            await manager.ensure_group_member(call.data["group_id"], actor)

        await manager.create_expense(
            group_id=call.data["group_id"],
            title=call.data["title"],
            amount=_cents(call.data["amount"]),
            paid_by_member_id=call.data["paid_by_member_id"],
            expense_date=_when(call.data.get("expense_date")),
            currency=call.data.get("currency"),
            category_id=call.data.get("category_id"),
            description=call.data.get("description"),
            actor_user_id=actor,
        )

    async def _settle_up(call: ServiceCall) -> None:
        """Record a reimbursement between two members."""

        manager = _manager(hass)
        actor = call.context.user_id

        if actor is not None:
            await manager.ensure_group_member(call.data["group_id"], actor)

        await manager.create_payment(
            group_id=call.data["group_id"],
            from_member_id=call.data["from_member_id"],
            to_member_id=call.data["to_member_id"],
            amount=_cents(call.data["amount"]),
            payment_date=_when(call.data.get("payment_date")),
            currency=call.data.get("currency"),
            description=call.data.get("description"),
            actor_user_id=actor,
        )

    hass.services.async_register(
        DOMAIN,
        SERVICE_ADD_EXPENSE,
        _add_expense,
        schema=ADD_EXPENSE_SCHEMA,
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_SETTLE_UP,
        _settle_up,
        schema=SETTLE_UP_SCHEMA,
    )


@callback
def async_unload_services(hass: HomeAssistant) -> None:
    """Take the actions away with the last entry."""

    hass.services.async_remove(DOMAIN, SERVICE_ADD_EXPENSE)
    hass.services.async_remove(DOMAIN, SERVICE_SETTLE_UP)


def _manager(hass: HomeAssistant) -> SharedExpensesManager:
    """Return the manager of the one entry there is."""

    entries = hass.data[DOMAIN]

    return next(iter(entries.values()))["manager"]


def _cents(amount: float) -> int:
    """Turn money into cents.

    Rounded, not truncated: 12.29 times a hundred lands on 1228.9999 in binary,
    and an expense a cent short of itself is the kind of wrong this integration
    holds integers to avoid.
    """

    return round(amount * 100)


def _when(given: datetime | None) -> datetime:
    """Return the day it happened, or now.

    A tag scanned on the way out of a shop is about that moment, and asking an
    automation to say so would be asking it to repeat itself.
    """

    return given if given is not None else dt_util.utcnow()
