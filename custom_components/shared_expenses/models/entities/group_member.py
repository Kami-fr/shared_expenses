"""Group member domain model."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from ..enums.group_role import GroupRole


@dataclass(frozen=True, slots=True)
class GroupMember:
    """Represents a member belonging to a group."""

    id: str

    group_id: str
    member_id: str

    role: GroupRole

    joined_at: datetime
    left_at: datetime | None

    created_at: datetime