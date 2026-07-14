"""Expense domain model."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from .split_rule import SplitRule


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

    split_rule: SplitRule | None = None
    """The rule that produced the shares, with its members spelled out.

    Only ever read to reopen the dialog as it was filled in: the shares are the
    truth, and the balances never look at this.
    """