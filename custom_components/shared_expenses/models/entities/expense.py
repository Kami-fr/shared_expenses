"""Expense domain model."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True, slots=True)
class Expense:
    """Represents an expense."""

    id: str

    group_id: str

    category_id: str | None

    title: str
    description: str | None

    amount: int
    currency: str

    paid_by_member_id: str

    expense_date: datetime

    created_at: datetime