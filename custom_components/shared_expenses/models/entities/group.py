"""Group domain model."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from .split_rule import SplitRule


@dataclass(frozen=True, slots=True)
class Group:
    """Represents a shared expenses group."""

    id: str

    name: str
    description: str | None

    currency: str

    icon: str | None
    color: str | None

    archived: bool

    created_at: datetime

    split_rule: SplitRule | None = None

    default_category_id: str | None = None
    """The category a new expense starts on. `None` means none in particular."""
    """Default split rule, used by expenses without a category."""