"""Payment domain model."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime

from ..enums import PaymentKind


@dataclass(frozen=True, slots=True)
class Payment:
    """Represents a payment between two members."""

    id: str

    group_id: str
    description: str | None

    from_member_id: str
    """Whoever is out of pocket: they paid, or they lent."""

    to_member_id: str
    """Whoever received it, or owes it."""

    amount: int
    """What actually moved, in the cents of `currency`."""

    currency: str
    """What it was handed over in. Not always the group's."""

    payment_date: datetime

    created_at: datetime

    converted_amount: int
    """The same money, in the group's currency, at `exchange_rate`.

    This is what the balances count. `amount` is what was handed over, and is
    only ever shown.

    Required, deliberately, as on an expense: a default would let a payment be
    built without saying what it came to for the group, and it would then clear
    nothing at all — silently, which is the only kind of wrong that matters
    here.
    """

    kind: PaymentKind = PaymentKind.REIMBURSEMENT
    """What this is saying.

    Read, never reckoned with: the balances treat both the same, because both
    are the same movement of money. Only the words change.
    """

    exchange_rate: int = 1_000_000
    """The rate applied, in millionths: 0.87681 is 876_810.

    Frozen. What someone owed was settled on the day they owed it; a rate that
    moved afterwards is a fact about the market, not about the debt.
    """

    rate_as_of: date | None = None
    """The day the rate is from, or None when no conversion happened."""
