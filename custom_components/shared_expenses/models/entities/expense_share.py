"""Expense share domain model."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True, slots=True)
class ExpenseShare:
    """Represents a member's share of an expense."""

    id: str

    expense_id: str
    member_id: str

    amount: int

    created_at: datetime