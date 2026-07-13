"""Member domain model."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True, slots=True)
class Member:
    """Represents a member."""

    id: str

    user_id: str | None

    name: str

    color: str | None

    created_at: datetime