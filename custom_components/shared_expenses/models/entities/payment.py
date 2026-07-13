"""Payment domain model."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True, slots=True)
class Payment:
    """Represents a payment between two members."""

    id: str

    group_id: str
    description: str | None

    from_member_id: str
    to_member_id: str

    amount: int

    payment_date: datetime

    created_at: datetime