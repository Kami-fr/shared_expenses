"""Shared test fixtures."""

from __future__ import annotations

from collections.abc import AsyncIterator
from pathlib import Path
import sys
import tempfile
from typing import Any

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from custom_components.shared_expenses.manager import (
    SharedExpensesManager,
)
from custom_components.shared_expenses.storage.database import Database

# `pytest-homeassistant-custom-component` is deliberately not used: it pulls in
# `homeassistant.runner`, which imports the Unix-only `fcntl`, so it cannot be
# installed here without breaking collection of every test. The WebSocket tests
# drive the real schemas and handlers directly instead.


class FakeConfig:
    """Minimal stand-in for `hass.config`."""

    def __init__(self, base: str) -> None:
        """Store the base directory."""

        self._base = base

    def path(self, *parts: str) -> str:
        """Return a path inside the base directory."""

        target = Path(self._base).joinpath(*parts)
        target.mkdir(parents=True, exist_ok=True)

        return str(target)


class FakeHass:
    """Minimal stand-in for `hass`.

    The storage layer only needs `config.path` and `async_add_executor_job`,
    so a full Home Assistant instance is not worth its cost here.
    """

    def __init__(self, base: str) -> None:
        """Initialize the fake instance."""

        self.config = FakeConfig(base)

    async def async_add_executor_job(self, func: Any, *args: Any) -> Any:
        """Run the job inline."""

        return func(*args)


@pytest.fixture
async def database() -> AsyncIterator[Database]:
    """Return an initialized database backed by a temporary file."""

    # SQLite in WAL mode keeps -wal/-shm files locked on Windows.
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as tmp:
        instance = Database(FakeHass(tmp))
        await instance.initialize()

        yield instance

        await instance.close()


@pytest.fixture
async def manager(database: Database) -> SharedExpensesManager:
    """Return a manager on a fresh database."""

    return SharedExpensesManager(database)
