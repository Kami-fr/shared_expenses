"""Tests for the one thing that leaves the house.

No network here: the real service is driven by hand when it changes, and a suite
that needs the internet is a suite that fails on a train. What is tested is
everything that happens to its answer — which is the part that can hurt, since
the answer is not ours and a rate is money.
"""

from __future__ import annotations

from datetime import date
from typing import Any

import aiohttp
import pytest

from custom_components.shared_expenses.clients.frankfurter import _read, fetch_rate
from custom_components.shared_expenses.exceptions import ExchangeRateUnavailableError


class FakeResponse:
    """One answer, as aiohttp hands them over."""

    def __init__(self, status: int, payload: Any) -> None:
        self.status = status
        self._payload = payload

    async def json(self) -> Any:
        return self._payload

    async def __aenter__(self) -> FakeResponse:
        """Enter the context aiohttp puts its responses in."""

        return self

    async def __aexit__(self, *_: object) -> None:
        """Leave it, with nothing to clean up."""

        return None


class FakeSession:
    """A session that answers as told, or raises as told."""

    def __init__(self, response: Any = None, raises: Exception | None = None) -> None:
        self._response = response
        self._raises = raises
        self.calls: list[tuple[str, dict]] = []

    def get(self, url: str, **kwargs: Any) -> Any:
        self.calls.append((url, kwargs))

        if self._raises is not None:
            raise self._raises

        return self._response


#
# Reading the answer
#


def test_the_plain_answer():
    """What the service really said, on the day this was written."""

    rate, as_of = _read(
        {"amount": 1.0, "base": "USD", "date": "2026-07-14", "rates": {"EUR": 0.87681}},
        "EUR",
    )

    assert rate == 876_810
    assert as_of == date(2026, 7, 14)


def test_the_day_given_is_kept_not_the_day_asked_for():
    """A Sunday answers with Friday's rate.

    The ECB publishes on working days. Storing the day that was asked for would
    label a rate with a day it is not from — a lie the size of a weekend.
    """

    _, as_of = _read({"date": "2026-07-10", "rates": {"EUR": 0.87489}}, "EUR")

    assert as_of == date(2026, 7, 10)


@pytest.mark.parametrize(
    "payload",
    [
        "not an object",
        None,
        [],
        {},
        {"date": "2026-07-14"},
        {"date": "2026-07-14", "rates": "nope"},
        {"date": "2026-07-14", "rates": {}},
        {"date": "2026-07-14", "rates": {"GBP": 0.8}},
    ],
)
def test_an_answer_without_the_rate_is_refused(payload: Any):
    """The shape is not ours: a KeyError deep in a handler helps nobody."""

    with pytest.raises(ExchangeRateUnavailableError):
        _read(payload, "EUR")


@pytest.mark.parametrize("value", [0, -1, "0.8", True, None])
def test_what_is_not_a_rate_is_refused(value: Any):
    with pytest.raises(ExchangeRateUnavailableError):
        _read({"date": "2026-07-14", "rates": {"EUR": value}}, "EUR")


@pytest.mark.parametrize("day", [None, "", "yesterday", "2026-13-45"])
def test_an_answer_without_a_usable_day_is_refused(day: Any):
    with pytest.raises(ExchangeRateUnavailableError):
        _read({"date": day, "rates": {"EUR": 0.87681}}, "EUR")


def test_the_float_on_the_wire_becomes_an_integer_here():
    """JSON has floats whatever anyone wants; they stop at this door."""

    rate, _ = _read({"date": "2026-07-14", "rates": {"EUR": 0.1}}, "EUR")

    assert rate == 100_000
    assert isinstance(rate, int)


#
# Reaching it, or not
#


async def test_a_rate_comes_back():
    session = FakeSession(
        FakeResponse(200, {"date": "2026-07-14", "rates": {"EUR": 0.87681}})
    )

    rate, as_of = await fetch_rate(session, "USD", "EUR", date(2026, 7, 14))

    assert (rate, as_of) == (876_810, date(2026, 7, 14))


async def test_the_day_is_in_the_url_and_the_pair_in_the_query():
    session = FakeSession(
        FakeResponse(200, {"date": "2026-07-14", "rates": {"EUR": 0.87681}})
    )

    await fetch_rate(session, "USD", "EUR", date(2026, 7, 14))

    url, kwargs = session.calls[0]

    assert url.endswith("/2026-07-14")
    assert kwargs["params"] == {"base": "USD", "symbols": "EUR"}


def test_a_user_agent_is_sent():
    """Without one the service answers 403.

    Found by calling it for real. Left to itself this would have shipped as
    "the rate service can never be reached", on every expense, forever.
    """

    from custom_components.shared_expenses.clients.frankfurter import USER_AGENT

    assert USER_AGENT


async def test_a_user_agent_is_on_the_request():
    session = FakeSession(
        FakeResponse(200, {"date": "2026-07-14", "rates": {"EUR": 0.87681}})
    )

    await fetch_rate(session, "USD", "EUR", date(2026, 7, 14))

    _, kwargs = session.calls[0]

    assert "User-Agent" in kwargs["headers"]


@pytest.mark.parametrize("status", [403, 404, 429, 500, 503])
async def test_a_refusal_is_not_a_crash(status: int):
    session = FakeSession(FakeResponse(status, {}))

    with pytest.raises(ExchangeRateUnavailableError):
        await fetch_rate(session, "USD", "EUR", date(2026, 7, 14))


async def test_being_offline_is_not_a_crash():
    """A Pi with no internet must not take the panel down with it."""

    session = FakeSession(raises=aiohttp.ClientError("no route to host"))

    with pytest.raises(ExchangeRateUnavailableError):
        await fetch_rate(session, "USD", "EUR", date(2026, 7, 14))


async def test_a_timeout_is_not_a_crash():
    session = FakeSession(raises=TimeoutError())

    with pytest.raises(ExchangeRateUnavailableError):
        await fetch_rate(session, "USD", "EUR", date(2026, 7, 14))
