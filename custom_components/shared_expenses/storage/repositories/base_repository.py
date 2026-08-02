"""Base repository."""

from __future__ import annotations

from typing import TYPE_CHECKING

import aiosqlite

if TYPE_CHECKING:
    from ..database import Database


class BaseRepository:
    """Base class for SQLite repositories."""

    def __init__(self, database: Database) -> None:
        """Initialize the repository."""

        self._database = database

    @property
    def _connection(self) -> aiosqlite.Connection:
        """Return the connection to read on, if there still is one.

        Asked for at every statement rather than kept from `initialize`: `close`
        puts the database's connection back to `None`, and a repository holding
        the old object went on calling `execute` on it — the driver's own
        `ValueError("Connection closed")`, which is nothing the coordinator
        recognises. Through the database it is `DatabaseNotReadyError`, which is
        one lost cycle rather than a traceback.
        """

        return self._database.connection
