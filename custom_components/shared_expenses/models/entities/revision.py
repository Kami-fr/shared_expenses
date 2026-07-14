"""Revision domain model."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any

from ..enums import RevisionAction, RevisionEntity


@dataclass(frozen=True, slots=True)
class FieldChange:
    """One field of one thing, before and after.

    The values are as stored — cents, ids, ISO dates — so that reading them back
    never depends on how they were once displayed.
    """

    field: str
    before: Any
    after: Any


@dataclass(frozen=True, slots=True)
class Revision:
    """Something that happened to an expense or a payment.

    Stands on its own, holding no reference to what it describes: a deletion is
    exactly the change worth explaining, and the row it explains is gone.
    """

    id: str

    group_id: str

    entity_type: RevisionEntity
    entity_id: str

    #: What the thing was called at the time, so a deleted one can be named.
    entity_label: str | None

    action: RevisionAction

    #: The Home Assistant account behind the change, when it had one.
    actor_user_id: str | None

    changes: tuple[FieldChange, ...]

    at: datetime
