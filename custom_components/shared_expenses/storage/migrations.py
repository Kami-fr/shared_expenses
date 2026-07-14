"""Database migrations for Shared Expenses."""

from __future__ import annotations

from logging import getLogger
from pathlib import Path

import aiosqlite
from homeassistant.core import HomeAssistant

from ..const import DATABASE_SCHEMA, DATABASE_VERSION

LOGGER = getLogger(__package__)

SQL_PATH = Path(__file__).parent / "sql"


async def initialize_database(
    connection: aiosqlite.Connection,
    hass: HomeAssistant,
) -> None:
    """Create the database schema, then migrate it to the latest version."""

    version = await _current_version(connection)

    if version is None:
        LOGGER.debug("Creating database schema.")

        await _run_script(connection, hass, DATABASE_SCHEMA)

        version = await _current_version(connection)

    if version is None:
        raise RuntimeError("The database schema has no version.")

    if version > DATABASE_VERSION:
        raise RuntimeError(
            f"The database is at version {version}, but this version of Shared "
            f"Expenses only supports up to version {DATABASE_VERSION}. "
            "Downgrading is not supported."
        )

    for target in range(version + 1, DATABASE_VERSION + 1):
        LOGGER.info("Migrating the database to version %s.", target)

        await _run_script(connection, hass, f"migration_v{target}.sql")

    LOGGER.debug("Database schema is at version %s.", DATABASE_VERSION)


async def _current_version(connection: aiosqlite.Connection) -> int | None:
    """Return the schema version, or None when the database is empty."""

    cursor = await connection.execute(
        """
        SELECT name
        FROM sqlite_master
        WHERE type = 'table' AND name = 'schema_version'
        """
    )

    exists = await cursor.fetchone()
    await cursor.close()

    if exists is None:
        return None

    cursor = await connection.execute("SELECT version FROM schema_version")

    row = await cursor.fetchone()
    await cursor.close()

    if row is None:
        return None

    return int(row["version"])


async def _run_script(
    connection: aiosqlite.Connection,
    hass: HomeAssistant,
    filename: str,
) -> None:
    """Execute a SQL script shipped with the integration."""

    script = await hass.async_add_executor_job(_read_script, filename)

    await connection.executescript(script)


def _read_script(filename: str) -> str:
    """Read a SQL script from disk."""

    return (SQL_PATH / filename).read_text(encoding="utf-8")
