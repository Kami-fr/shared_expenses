"""Category domain model."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from .split_rule import SplitRule


@dataclass(frozen=True, slots=True)
class Category:
    """Represents an expense category."""

    id: str

    group_id: str

    name: str

    icon: str | None
    color: str | None

    created_at: datetime

    split_rule: SplitRule | None = None
    """Default split rule for expenses of this category."""