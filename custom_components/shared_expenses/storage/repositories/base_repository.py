"""Base repository."""

from __future__ import annotations

import aiosqlite


class BaseRepository:
    """Base class for SQLite repositories."""

    def __init__(self, connection: aiosqlite.Connection) -> None:
        """Initialize the repository."""

        self._connection = connection