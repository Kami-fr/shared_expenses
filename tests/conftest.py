"""Shared test fixtures."""

from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator
from dataclasses import replace
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


class FakeBus:
    """Stand-in for `hass.bus`, remembering what was fired on it.

    The manager announces every write on the real bus so automations can react;
    the tests hold those events to prove the announcement was made, and made
    with what an automation would need to trigger on.
    """

    def __init__(self) -> None:
        """Start with an empty log of fired events."""

        self.events: list[tuple[str, dict[str, Any]]] = []

    def async_fire(
        self,
        event_type: str,
        event_data: dict[str, Any] | None = None,
        *args: Any,
        **kwargs: Any,
    ) -> None:
        """Record a fired event, as Home Assistant would broadcast it."""

        self.events.append((event_type, event_data or {}))


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
        self.bus = FakeBus()
        self._tasks: list[asyncio.Task] = []

    async def async_add_executor_job(self, func: Any, *args: Any) -> Any:
        """Run the job inline."""

        return func(*args)

    def verify_event_loop_thread(self, what: str) -> None:
        """Home Assistant refuses a loop-only call made off the loop.

        A no-op here, because these tests are the loop. It exists because the
        manager sends a dispatcher signal on every write and the real thing is
        asked this first — a stand-in that does not answer what it stands in for
        fails the caller rather than the code, which is how this fake has misled
        before.
        """

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

    Holds no Home Assistant machinery: the handlers call `send_result`,
    `send_error` and `send_message`, keep what they subscribed in
    `subscriptions`, and read from `user`. A real account has a name, and
    creating a group falls back on it to name the admin, so this one has one too
    — the stand-in is only worth what it stands in for.
    """

    def __init__(
        self,
        user_id: str,
        *,
        is_admin: bool = False,
        name: str = "Stephane",
    ) -> None:
        """Initialize the connection of one account."""

        self.user = SimpleNamespace(id=user_id, is_admin=is_admin, name=name)
        self.results: dict[int, Any] = {}
        self.errors: dict[int, tuple[str, str]] = {}
        self.messages: list[Any] = []

        # Home Assistant drops what is left here when the connection goes. A
        # subscription is only ever as good as its unsubscribing, so the tests
        # hold the real callbacks and can run them.
        self.subscriptions: dict[int, Any] = {}

    def send_message(self, message: Any) -> None:
        """Record a push, which is what a subscription sends."""

        self.messages.append(message)

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

    Registered exactly as `__init__.py` does it — the same dict, under the same
    key — so a command that cannot find its manager here would not find it in
    Home Assistant either. The coordinator is left out: nothing driven through
    these tests reads it, and a stand-in for it would stand in for nothing.
    """

    hass.data = {DOMAIN: {"entry-id": {"manager": manager}}}

    return hass


#
# One project, three people. Shared by the tests about who may do what and the
# ones about bringing things back — pytest injects it, so neither has to import
# it from the other, which is what shadowing complaints are made of.
#

ADMIN = "ha-admin"
PLAIN = "ha-plain"


@pytest.fixture
async def project(manager: SharedExpensesManager) -> dict[str, Any]:
    """Return a group with its admin, an ordinary member, and a guest.

    Everything is granted: that is what a group looks like out of the box, and
    what a test has to take away on purpose.

    Three people and two roles. There is no third: whoever makes the group runs
    it, everybody else is a member, and nobody is handed anything in between.
    """

    group = await manager.create_group(
        group_name="The Flat",
        admin_name="Stephane",
        admin_user_id=ADMIN,
    )

    admin = await manager.get_member_for_user(ADMIN)
    assert admin is not None

    plain = await manager.create_group_member(
        group_id=group.id,
        name="Antonin",
        user_id=PLAIN,
    )

    # No account: carries expenses, never logs in.
    guest = await manager.create_group_member(group_id=group.id, name="Marc")

    return {"group": group, "admin": admin, "plain": plain, "guest": guest}


async def send(
    hass: FakeHass,
    connection: FakeConnection,
    handler: Any,
    payload: dict[str, Any],
) -> None:
    """Send a message through a command's own schema and decorators.

    The type is derived from the handler rather than spelled out, so a payload
    can never be sent to a command it does not belong to.
    """

    command = handler.__name__.removeprefix("websocket_")

    msg = handler._ws_schema(
        {"id": 1, "type": f"shared_expenses/{command}", **payload},
    )

    handler(hass, connection, msg)

    await hass.settle()


async def close_project(
    manager: SharedExpensesManager,
    group_id: str,
    *keep: Any,
) -> None:
    """Take every permission off a group but the ones named."""

    group = await manager.get_group(group_id)

    await manager.update_group(replace(group, permissions=frozenset(keep)))
