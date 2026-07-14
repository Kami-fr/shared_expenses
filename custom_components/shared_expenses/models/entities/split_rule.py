"""Split rule domain model."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, field


@dataclass(frozen=True, slots=True)
class Remainder:
    """Who takes what is left once the envelope is shared.

    The same shape as the envelope, one level down: a member with an amount
    takes exactly that, a member without takes an equal share of what the
    others left. `members` at `None` means the payer takes all of it.
    """

    members: tuple[str, ...] | None = None
    """Members taking part in the remainder. `None` means the payer alone."""

    fixed: Mapping[str, int] = field(default_factory=dict)
    """Amounts in cents owed by specific members out of the remainder."""


@dataclass(frozen=True, slots=True)
class SplitRule:
    """Describes how an expense amount is split between members.

    Two steps, both shared equally by default:

    1. `envelope` is split equally between `participants`. Leave it at `None`
       and the whole expense is the envelope, which is the plain equal split.
    2. Whatever is left goes to `remainder`, which by default is the payer.
    """

    envelope: int | None = None
    """Amount in cents shared equally. `None` means the whole expense."""

    participants: tuple[str, ...] | None = None
    """Members sharing the envelope. `None` means every active group member."""

    remainder: Remainder = field(default_factory=Remainder)
    """Who takes what the envelope left behind."""
