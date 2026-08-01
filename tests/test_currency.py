"""Tests for converting money.

Everything here stays in whole numbers. A rate is not money, but a rate applied
to money is, and a float would be close enough for a weather forecast and not
for a balance that has to come back the same tomorrow.
"""

from __future__ import annotations

import pytest

from custom_components.shared_expenses.exceptions import InvalidExchangeRateError
from custom_components.shared_expenses.helpers.currency import (
    RATE_ONE,
    apportion,
    convert,
    rate_from_decimal,
    rate_to_decimal,
    validate_rate,
)


def test_the_plain_case():
    """100 USD at 0.87681, which is what the ECB said on the day of writing."""

    assert convert(10_000, rate_from_decimal("0.87681")) == 8_768


def test_a_rate_of_one_changes_nothing():
    assert convert(8_542, RATE_ONE) == 8_542


def test_halves_go_up_not_to_even():
    """Python's own round() would give 0 and 2 here.

    It rounds halves to even, which is defensible in statistics and
    indefensible on a receipt: half a cent owed is a cent owed.
    """

    half = RATE_ONE // 2

    assert convert(1, half) == 1
    assert convert(3, half) == 2
    assert convert(5, half) == 3


def test_nothing_converts_to_nothing():
    assert convert(0, rate_from_decimal("0.87681")) == 0


def test_a_refund_converts_to_exactly_what_it_undoes():
    """Otherwise a shop refunding what it charged would leave a cent behind."""

    rate = rate_from_decimal("0.87681")

    for amount in range(1, 500):
        assert convert(-amount, rate) == -convert(amount, rate)


@pytest.mark.parametrize("rate", [0, -1])
def test_a_rate_must_be_positive(rate: int):
    with pytest.raises(InvalidExchangeRateError):
        validate_rate(rate)


def test_an_absurd_rate_is_refused():
    """A typo turning 5 EUR into a fortune is worth a visible error."""

    with pytest.raises(InvalidExchangeRateError):
        validate_rate(RATE_ONE * 100_000)


def test_a_boolean_is_not_a_rate():
    with pytest.raises(InvalidExchangeRateError):
        validate_rate(True)


#
# Reading and writing a rate
#


@pytest.mark.parametrize(
    ("typed", "expected"),
    [
        ("1", RATE_ONE),
        ("0.5", 500_000),
        ("0,5", 500_000),
        ("0.87681", 876_810),
        ("1.1", 1_100_000),
        (" 0.87681 ", 876_810),
        ("2", 2 * RATE_ONE),
        (".5", 500_000),
    ],
)
def test_a_rate_is_read_off_the_text(typed: str, expected: int):
    assert rate_from_decimal(typed) == expected


def test_a_rate_is_not_read_through_a_float():
    """0.1 is not 0.1 in binary, and a rate a millionth short costs a cent."""

    assert rate_from_decimal("0.1") == 100_000
    assert rate_from_decimal("0.07") == 70_000
    assert rate_from_decimal("0.000001") == 1


@pytest.mark.parametrize("typed", ["", "   ", "abc", "1.2.3", "0.1a", "--1"])
def test_what_is_not_a_rate_is_refused(typed: str):
    with pytest.raises(InvalidExchangeRateError):
        rate_from_decimal(typed)


def test_a_seventh_decimal_is_refused_rather_than_dropped():
    """Silently losing it would be a rate nobody typed."""

    with pytest.raises(InvalidExchangeRateError):
        rate_from_decimal("0.1234567")


@pytest.mark.parametrize("typed", ["0.87681", "1", "2", "0.5", "1.1"])
def test_a_rate_survives_the_round_trip(typed: str):
    assert rate_to_decimal(rate_from_decimal(typed)) == typed.replace(",", ".")


def test_apportion_hands_out_every_cent():
    """Ten euros in thirds is 3,34 and 3,33 and 3,33, never 9,99."""

    shares = apportion({"a": 1, "b": 1, "c": 1}, 1_000)

    assert sum(shares.values()) == 1_000
    assert shares == {"a": 334, "b": 333, "c": 333}


def test_apportion_keeps_the_proportions():
    """A share of a fifth of the bill stays a fifth of it in the other money."""

    shares = apportion({"a": 2_000, "b": 8_000}, 8_768)

    assert shares == {"a": 1_754, "b": 7_014}
    assert sum(shares.values()) == 8_768


def test_apportion_survives_what_converting_one_by_one_would_lose():
    """The case this exists for.

    Three shares of a cent, at a third: each on its own rounds down to nothing,
    so the shares would add up to zero against a total of one, and the expense
    would weigh a cent that nobody owed. Dividing the total instead cannot lose
    it -- somebody gets that cent.
    """

    total = convert(3, 333_333)
    shares = apportion({"a": 1, "b": 1, "c": 1}, total)

    assert total == 1
    assert sum(shares.values()) == 1
    assert shares == {"a": 1, "b": 0, "c": 0}


def test_apportion_is_deterministic_on_a_tie():
    """Two shares wanting the same half-cent: the first one asked gets it."""

    assert apportion({"a": 1, "b": 1}, 3) == {"a": 2, "b": 1}
    assert apportion({"b": 1, "a": 1}, 3) == {"b": 2, "a": 1}


def test_apportion_refuses_what_cannot_be_divided():
    with pytest.raises(InvalidExchangeRateError):
        apportion({"a": 0}, 100)

    with pytest.raises(InvalidExchangeRateError):
        apportion({"a": -1, "b": 2}, 100)

    with pytest.raises(InvalidExchangeRateError):
        apportion({"a": 1}, -1)


def test_apportion_takes_a_refund_the_whole_way_round():
    """Shares and total make the same trip, in whichever direction."""

    assert apportion({"a": -2_000, "b": -8_000}, -8_768) == {"a": -1_754, "b": -7_014}


def test_apportion_refuses_a_share_pulling_against_its_total():
    """A member owing money because a shop gave some back means nothing."""

    with pytest.raises(InvalidExchangeRateError):
        apportion({"a": -100, "b": 20}, -80)
