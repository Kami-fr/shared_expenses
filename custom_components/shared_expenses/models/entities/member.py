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

    # Whether this member wears their Home Assistant photo rather than the
    # coloured initials. Only ever true for an account: a guest has no photo to
    # borrow, and the panel falls back to the initials when there is none.
    use_ha_avatar: bool = False