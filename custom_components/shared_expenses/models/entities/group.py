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

    exposed: bool = False
    """Whether this group puts its figures on the Home Assistant dashboard.

    False, and deliberately so. Entities are not walled: every account in the
    house reads every entity's state, whatever this integration says about who
    is in which group. Turning this on takes that wall down for this group, and
    nothing that takes a wall down may happen to somebody who did not ask.
    """

    permissions: frozenset[Permission] = field(default=DEFAULT_PERMISSIONS)
    """What an ordinary member of this group may do.

    The same for everybody: the admin is above it, and nobody else is below it.
    Held as the set of what is granted rather than what is refused, so an empty
    set reads as the closed group it is.
    """