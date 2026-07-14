"""Split rule domain model."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass, field

from ..enums import RemainderTarget


@dataclass(frozen=True, slots=True)
class SplitRule:
    """Describes how an expense amount is split between members.

    Resolution order:

    1. `fixed` amounts are assigned to their members first.
    2. What is left is the distributable amount.
    3. `cap`, when set, limits the envelope actually shared between
       `participants`; the envelope is `min(distributable, cap)`.
    4. The surplus left above the cap goes to `remainder`.
    """

    participants: tuple[str, ...] | None = None
    """Members sharing the envelope. `None` means every active group member."""

    fixed: Mapping[str, int] = field(default_factory=dict)
    """Amounts in cents assigned to specific members before distribution."""

    cap: int | None = None
    """Upper bound in cents of the shared envelope. `None` means no cap."""

    remainder: RemainderTarget = RemainderTarget.PAYER
    """Destination of the surplus left above the cap."""
