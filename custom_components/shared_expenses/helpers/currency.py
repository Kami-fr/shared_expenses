"""Converting money, without ever leaving the integers.

A rate is not money, but a rate applied to money is. Everything here stays in
whole numbers: cents in, cents out, and a rate in millionths. A float would be
close enough for a weather forecast and not for a balance that has to come back
the same tomorrow.
"""

from __future__ import annotations

from collections.abc import Mapping

from ..exceptions import InvalidExchangeRateError

#: A rate of one, in millionths. 0.87681 is 876_810.
RATE_ONE = 1_000_000

#: The most a rate can be, so a typo cannot turn 5 EUR into a fortune.
RATE_MAX = RATE_ONE * 10_000


def validate_rate(rate: int) -> int:
    """Return the rate, refusing what cannot be one."""

    if isinstance(rate, bool) or not isinstance(rate, int):
        raise InvalidExchangeRateError(f"A rate must be a whole number, got {rate!r}")

    if rate <= 0:
        raise InvalidExchangeRateError("A rate must be positive.")

    if rate > RATE_MAX:
        raise InvalidExchangeRateError("This rate is not plausible.")

    return rate


def convert(amount: int, rate: int) -> int:
    """Return `amount` at `rate`, in the cents of the other currency.

    Rounded half up, in integers: `amount * rate` is exact, and adding half a
    millionth before the floor divide is the same as rounding without ever
    involving a float. Python's own `round` would not do — it rounds halves to
    even, so 0,005 would land on 0,00 and 0,015 on 0,02, which is defensible in
    statistics and indefensible on a receipt.
    """

    if amount < 0:
        raise InvalidExchangeRateError("Cannot convert a negative amount.")

    validate_rate(rate)

    return (amount * rate + RATE_ONE // 2) // RATE_ONE


def apportion(amounts: Mapping[str, int], total: int) -> dict[str, int]:
    """Return `total`, divided in the same proportions as `amounts`.

    This is how shares cross a currency. They are settled on in what was handed
    over — the dollars printed on the receipt, which is what the split editor
    sits under and therefore what its figures mean — while the group counts in
    its own money. Every share has to make the same trip the total made.

    Converting each share on its own would not do. Three shares of one cent at
    a rate of a third each round down to nothing, and the expense would weigh
    zero against a total that weighs one — the shares would no longer add up to
    what they are shares of, and the balances count both. So the converted
    total is divided instead, and it is divided exactly: the cents that
    flooring leaves over go to the largest remainders first, ties to whoever
    came first, so the same expense always resolves the same way.
    """

    if total < 0:
        raise InvalidExchangeRateError("Cannot apportion a negative amount.")

    if any(value < 0 for value in amounts.values()):
        raise InvalidExchangeRateError("Cannot apportion a negative share.")

    whole = sum(amounts.values())

    if whole <= 0:
        raise InvalidExchangeRateError("Cannot apportion between nothing.")

    shares: dict[str, int] = {}
    remainders: list[tuple[int, int, str]] = []

    for index, (member_id, value) in enumerate(amounts.items()):
        scaled = value * total
        shares[member_id] = scaled // whole

        # Negated, so that sorting the whole tuple downwards still reads the
        # order they came in upwards.
        remainders.append((scaled % whole, -index, member_id))

    left = total - sum(shares.values())

    for _, _, member_id in sorted(remainders, reverse=True)[:left]:
        shares[member_id] += 1

    return shares


def rate_from_decimal(value: str) -> int:
    """Read a rate typed as "0,87681" into millionths.

    Parsed by hand rather than through float: "0.1" is not 0.1 in binary, and a
    rate that arrives a millionth short would quietly cost somebody a cent.
    """

    text = value.strip().replace(",", ".")

    if not text:
        raise InvalidExchangeRateError("A rate is needed.")

    negative = text.startswith("-")
    whole, _, fraction = text.lstrip("+-").partition(".")

    if not whole and not fraction:
        raise InvalidExchangeRateError(f"This is not a rate: {value!r}")

    if not (whole + fraction).isdigit():
        raise InvalidExchangeRateError(f"This is not a rate: {value!r}")

    # Six digits, no more: a seventh would be silently dropped, so say so.
    if len(fraction) > 6:
        raise InvalidExchangeRateError("A rate carries at most six decimals.")

    scaled = int(whole or "0") * RATE_ONE + int(fraction.ljust(6, "0") or "0")

    return validate_rate(-scaled if negative else scaled)


def rate_to_decimal(rate: int) -> str:
    """Return a rate as it would be typed, for showing and for storing as text."""

    whole, fraction = divmod(rate, RATE_ONE)

    if fraction == 0:
        return str(whole)

    return f"{whole}.{fraction:06d}".rstrip("0")
