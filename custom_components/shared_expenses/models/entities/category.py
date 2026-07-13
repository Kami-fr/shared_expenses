"""Category domain model."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True, slots=True)
class Category:
    """Represents an expense category."""

    id: str

    group_id: str

    name: str

    icon: str | None
    color: str | None

    created_at: datetime