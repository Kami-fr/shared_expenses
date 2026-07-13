"""Database management for Shared Expenses."""

from __future__ import annotations

from pathlib import Path
from .migrations import initialize_database
import aiosqlite
from homeassistant.core import HomeAssistant
from .repositories.group_repository import GroupRepository

from ..const import DATABASE_NAME


class Database:
    """Manage the SQLite database."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the database."""

        self._hass = hass
        self._connection: aiosqlite.Connection | None = None
        self._database_path = Path(hass.config.path(".storage")) / DATABASE_NAME
        self.group_repository: GroupRepository | None = None

    async def initialize(self) -> None:
        """Initialize the database."""

        self._connection = await aiosqlite.connect(self._database_path)
        self._connection.row_factory = aiosqlite.Row
        self.group_repository = GroupRepository(self._connection)

        await self._connection.execute("PRAGMA foreign_keys = ON;")
        await initialize_database(self._connection)

    async def close(self) -> None:
        """Close the database connection."""

        if self._connection is None:
            return

        await self._connection.close()
        self._connection = None