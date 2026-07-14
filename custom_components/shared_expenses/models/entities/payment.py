"""Payment domain model."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

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

    payment_date: datetime

    created_at: datetime

    kind: PaymentKind = PaymentKind.REIMBURSEMENT
    """What this is saying.

    Read, never reckoned with: the balances treat both the same, because both
    are the same movement of money. Only the words change.
    """
