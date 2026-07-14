"""Identifier helpers."""

from __future__ import annotations

from ulid import ULID


def new_id() -> str:
    """Return a new ULID."""

    return str(ULID())