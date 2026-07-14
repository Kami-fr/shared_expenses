"""Shared test fixtures."""

from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator
from pathlib import Path
import sys
import tempfile
from types import SimpleNamespace
from typing import Any

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from custom_components.shared_expenses.const import DOMAIN
from custom_components.shared_expenses.manager import (
    SharedExpensesManager,
)
from custom_components.shared_expenses.storage.database import Database

# `pytest-homeassistant-custom-component` is deliberately not used: it pulls in
# `homeassistant.runner`, which imports the Unix-only `fcntl`, so it cannot be
# installed here without breaking collection of every test. The WebSocket tests
# drive the real schemas, decorators and handlers directly instead — see
# `test_websocket.py`. What they lose is the transport; what they keep is
# everything this integration actually wrote.


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
    so a full Home Assistant instance is not worth its cost here. The WebSocket
    tests need one thing more: `async_response` hands the handler to
    `async_create_background_task` rather than awaiting it, so the tests must be
    able to wait for what it scheduled.
    """

    def __init__(self, base: str) -> None:
        """Initialize the fake instance."""

        self.config = FakeConfig(base)
        self.data: dict[str, Any] = {}
        self._tasks: list[asyncio.Task] = []

    async def async_add_executor_job(self, func: Any, *args: Any) -> Any:
        """Run the job inline."""

        return func(*args)

    def async_create_background_task(
        self,
        target: Any,
        name: str,
        eager_start: bool = True,
    ) -> asyncio.Task:
        """Schedule a handler, keeping it so `settle` can wait for it."""

        task = asyncio.ensure_future(target)
        self._tasks.append(task)

        return task

    async def settle(self) -> None:
        """Wait for every handler scheduled so far."""

        while self._tasks:
            await asyncio.gather(*self._tasks)
            self._tasks = [task for task in self._tasks if not task.done()]


class FakeConnection:
    """Stand-in for an `ActiveConnection`, remembering what it was sent.

    Holds no Home Assistant machinery: the handlers only ever call
    `send_result`, `send_error`, and read `user.id`.
    """

    def __init__(self, user_id: str, *, is_admin: bool = False) -> None:
        """Initialize the connection of one account."""

        self.user = SimpleNamespace(id=user_id, is_admin=is_admin)
        self.results: dict[int, Any] = {}
        self.errors: dict[int, tuple[str, str]] = {}

    def send_result(self, msg_id: int, result: Any = None) -> None:
        """Record a successful answer."""

        self.results[msg_id] = result

    def send_error(self, msg_id: int, code: str, message: str) -> None:
        """Record a refusal."""

        self.errors[msg_id] = (code, message)


@pytest.fixture
async def hass() -> AsyncIterator[FakeHass]:
    """Return a `hass` on a temporary config directory."""

    # SQLite in WAL mode keeps -wal/-shm files locked on Windows.
    with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as tmp:
        yield FakeHass(tmp)


@pytest.fixture
async def database(hass: FakeHass) -> AsyncIterator[Database]:
    """Return an initialized database backed by a temporary file."""

    instance = Database(hass)
    await instance.initialize()

    yield instance

    await instance.close()


@pytest.fixture
async def manager(database: Database) -> SharedExpensesManager:
    """Return a manager on a fresh database."""

    return SharedExpensesManager(database)


@pytest.fixture
async def loaded(hass: FakeHass, manager: SharedExpensesManager) -> FakeHass:
    """Return a `hass` holding the manager where the commands look for it.

    Registered exactly as `__init__.py` does it, so a command that cannot find
    its manager here would not find it in Home Assistant either.
    """

    hass.data = {DOMAIN: {"entry-id": manager}}

    return hass
