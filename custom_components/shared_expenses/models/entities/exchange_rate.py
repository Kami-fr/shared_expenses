"""Exchange rate domain model."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime

from ..enums import RateSource


@dataclass(frozen=True, slots=True)
class ExchangeRate:
    """What one currency was worth in another, on a given day."""

    id: str

    base: str
    """The currency being converted from, e.g. USD."""

    quote: str
    """The currency being converted to, e.g. EUR."""

    rate: int
    """In millionths: 0.87681 is 876_810. Never a float — this is money."""

    as_of: date
    """The day the rate is from.

    Not always the day it was asked for: the ECB publishes nothing at the
    weekend, so a Sunday takes Friday's. Whoever reads it deserves to know.
    """

    source: RateSource

    created_at: datetime
