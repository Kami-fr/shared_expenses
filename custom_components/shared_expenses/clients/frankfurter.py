"""The one thing in this integration that leaves the house.

Frankfurter serves the European Central Bank's reference rates, free and without
a key. Home Assistant ships three currency integrations of its own — fixer,
openexchangerates, currencylayer — and every one of them wants an account; this
one does not, which is the only reason it is here rather than one of those.

Everything about it is treated as unreliable, because it is: it can be down, the
Pi can be offline, and the answer can be a shape nobody expected. Not one of
those is worth stopping someone entering a shop over — the caller falls back on
what it knows, and asks for a rate by hand as a last resort.
"""

from __future__ import annotations

from datetime import date
from logging import getLogger
from typing import Any

import aiohttp

from ..exceptions import ExchangeRateUnavailableError

LOGGER = getLogger(__package__)

BASE_URL = "https://api.frankfurter.app"

#: Sent because it is asked for: without one the service answers 403, which
#: took a real request to find out and would have shipped as "always offline".
USER_AGENT = "HomeAssistant-SharedExpenses"

#: Long enough for a slow morning, short enough that a dialog is not stuck.
TIMEOUT = aiohttp.ClientTimeout(total=10)

#: Two codes for six causes, because there are only two things to do about
#: them. Down, offline, or answering a shape nobody can read all leave the
#: reader in the same place — type a rate by hand — while a pair the service
#: does not carry will not be fixed by waiting or by retrying. The six messages
#: stay distinct behind the codes, for the log.
UNREACHABLE = "rate_service_unreachable"
UNKNOWN_CURRENCY = "rate_unknown_currency"


async def fetch_rate(
    session: aiohttp.ClientSession,
    base: str,
    quote: str,
    on: date,
) -> tuple[int, date]:
    """Return the rate for a pair on a day, and the day it is really from.

    The two dates differ more often than not: the ECB publishes on working days,
    so a Sunday answers with Friday's rate. Frankfurter says which day it gave,
    and that is what gets stored — a rate labelled with a day it is not from is
    a lie the size of a weekend.
    """

    url = f"{BASE_URL}/{on.isoformat()}"
    params = {"base": base, "symbols": quote}

    try:
        async with session.get(
            url,
            params=params,
            headers={"User-Agent": USER_AGENT},
            timeout=TIMEOUT,
        ) as response:
            if response.status != 200:
                raise ExchangeRateUnavailableError(
                    f"The rate service answered {response.status}.",
                    code=UNREACHABLE,
                )

            payload = await response.json()
    except ExchangeRateUnavailableError:
        raise
    except (aiohttp.ClientError, TimeoutError) as err:
        # Offline, DNS gone, service down: all the same to the caller.
        LOGGER.debug("Could not reach the rate service: %s", err)

        raise ExchangeRateUnavailableError(
            "The rate service could not be reached.",
            code=UNREACHABLE,
        ) from err

    return _read(payload, quote)


def _read(payload: Any, quote: str) -> tuple[int, date]:
    """Pull the rate and its day out of the answer.

    Written as though the answer were hostile, because it is simply not ours:
    the shape can change, and a KeyError deep in a handler says nothing useful
    to whoever is staring at a dialog.
    """

    if not isinstance(payload, dict):
        raise ExchangeRateUnavailableError(
            "The rate service answered nonsense.",
            code=UNREACHABLE,
        )

    rates = payload.get("rates")

    if not isinstance(rates, dict) or quote not in rates:
        raise ExchangeRateUnavailableError(
            f"The rate service knows no {quote}.",
            code=UNKNOWN_CURRENCY,
        )

    value = rates[quote]

    if not isinstance(value, int | float) or isinstance(value, bool) or value <= 0:
        raise ExchangeRateUnavailableError(
            f"This is not a rate: {value!r}",
            code=UNREACHABLE,
        )

    try:
        as_of = date.fromisoformat(str(payload.get("date")))
    except (TypeError, ValueError) as err:
        raise ExchangeRateUnavailableError(
            "The rate service gave no day for its rate.",
            code=UNREACHABLE,
        ) from err

    # The wire is JSON, so this arrives as a float whatever anyone wants. It
    # becomes an integer here, once, and never goes back.
    return round(value * 1_000_000), as_of
