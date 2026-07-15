"""Group domain model."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime

from ..enums import Permission
from .split_rule import SplitRule

#: What a group lets its members do unless it says otherwise: all of it.
DEFAULT_PERMISSIONS: frozenset[Permission] = frozenset(Permission)


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
    """Default split rule, used by expenses without a category."""

    default_category_id: str | None = None
    """The category a new expense starts on. `None` means none in particular."""

    permissions: frozenset[Permission] = field(default=DEFAULT_PERMISSIONS)
    """What an ordinary member of this group may do.

    The same for everybody: an owner and an admin are above it, and nobody else
    is below it. Held as the set of what is granted rather than what is refused,
    so an empty set reads as the closed group it is.
    """