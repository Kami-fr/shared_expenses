"""Database migrations for Shared Expenses."""

from __future__ import annotations

from logging import getLogger
from pathlib import Path

import aiosqlite

from ..const import DATABASE_SCHEMA

LOGGER = getLogger(__package__)


async def initialize_database(connection: aiosqlite.Connection) -> None:
    """Initialize or migrate the database."""

    cursor = await connection.execute(
        "SELECT name FROM sqlite_master WHERE type='table';"
    )

    tables = await cursor.fetchall()

    await cursor.close()

    if tables:
        LOGGER.debug("Database schema already exists.")
        return

    LOGGER.debug("Creating database schema.")

    await _create_schema(connection)


async def _create_schema(connection: aiosqlite.Connection) -> None:
    """Create the initial database schema."""

    sql_file = Path(__file__).parent / "sql" / DATABASE_SCHEMA

    script = sql_file.read_text(encoding="utf-8")

    await connection.executescript(script)

    await connection.commit()