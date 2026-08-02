"""Database management for Shared Expenses."""

from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator, Callable
from contextlib import asynccontextmanager
from logging import getLogger
from pathlib import Path
from typing import Any

import aiosqlite
from homeassistant.core import HomeAssistant

from ..const import DATABASE_NAME
from ..exceptions import DatabaseNotReadyError
from .migrations import initialize_database
from .repositories.category_repository import CategoryRepository
from .repositories.exchange_rate_repository import ExchangeRateRepository
from .repositories.expense_repository import ExpenseRepository
from .repositories.group_member_repository import GroupMemberRepository
from .repositories.group_repository import GroupRepository
from .repositories.member_repository import MemberRepository
from .repositories.payment_repository import PaymentRepository
from .repositories.revision_repository import RevisionRepository

LOGGER = getLogger(__package__)


class Database:
    """Manage the SQLite database."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the database."""

        self._hass = hass

        self._database_path = Path(hass.config.path(".storage")) / DATABASE_NAME

        self._connection: aiosqlite.Connection | None = None

        # One connection carries one transaction, so one writer at a time. The
        # lock is what makes that true between tasks; the owner is what lets the
        # task holding it nest without waiting on itself.
        self._lock = asyncio.Lock()
        self._owner: asyncio.Task[Any] | None = None

        #: What the open transaction promised to tell the house, once it lands.
        self._after_commit: list[Callable[[], None]] = []

        self._group_repository: GroupRepository | None = None
        self._member_repository: MemberRepository | None = None
        self._group_member_repository: GroupMemberRepository | None = None
        self._category_repository: CategoryRepository | None = None
        self._expense_repository: ExpenseRepository | None = None
        self._payment_repository: PaymentRepository | None = None
        self._revision_repository: RevisionRepository | None = None
        self._exchange_rate_repository: ExchangeRateRepository | None = None

    @property
    def hass(self) -> HomeAssistant:
        """Return the Home Assistant instance this database belongs to.

        The manager needs it for one thing: Home Assistant's own HTTP session,
        which is what a rate is fetched over.
        """

        return self._hass

    @property
    def connection(self) -> aiosqlite.Connection:
        """Return the SQLite connection.

        Raised rather than asserted, unlike the repositories below: those are
        `None` only before `initialize`, which is a programming mistake, while
        this one goes back to `None` on every `close` — see
        `DatabaseNotReadyError`.
        """

        if self._connection is None:
            raise DatabaseNotReadyError

        return self._connection

    @property
    def group_repository(self) -> GroupRepository:
        """Return the group repository."""

        assert self._group_repository is not None
        return self._group_repository

    @property
    def member_repository(self) -> MemberRepository:
        """Return the member repository."""

        assert self._member_repository is not None
        return self._member_repository

    @property
    def group_member_repository(self) -> GroupMemberRepository:
        """Return the group member repository."""

        assert self._group_member_repository is not None
        return self._group_member_repository

    @property
    def category_repository(self) -> CategoryRepository:
        """Return the category repository."""

        assert self._category_repository is not None
        return self._category_repository

    @property
    def expense_repository(self) -> ExpenseRepository:
        """Return the expense repository."""

        assert self._expense_repository is not None
        return self._expense_repository

    @property
    def payment_repository(self) -> PaymentRepository:
        """Return the payment repository."""

        assert self._payment_repository is not None
        return self._payment_repository

    @property
    def revision_repository(self) -> RevisionRepository:
        """Return the revision repository."""

        assert self._revision_repository is not None
        return self._revision_repository

    @property
    def exchange_rate_repository(self) -> ExchangeRateRepository:
        """Return the exchange rate repository."""

        assert self._exchange_rate_repository is not None
        return self._exchange_rate_repository

    async def initialize(self) -> None:
        """Initialize the database."""

        # `isolation_level=None` disables the implicit transaction the driver
        # would otherwise open on the first write and never commit. Statements
        # run outside `transaction()` commit on their own, and `transaction()`
        # stays the only place issuing BEGIN and COMMIT.
        self._connection = await aiosqlite.connect(
            self._database_path,
            isolation_level=None,
        )

        self._connection.row_factory = aiosqlite.Row

        await self._connection.execute("PRAGMA foreign_keys = ON;")
        await self._connection.execute("PRAGMA journal_mode = WAL;")

        await initialize_database(self._connection, self._hass)

        # The database rather than the connection: a repository given the object
        # would still hold it after `close`, and read on a shut file. Asking here
        # each time is what makes a read after unload a `DatabaseNotReadyError`.
        self._group_repository = GroupRepository(self)
        self._member_repository = MemberRepository(self)
        self._group_member_repository = GroupMemberRepository(self)
        self._category_repository = CategoryRepository(self)
        self._expense_repository = ExpenseRepository(self)
        self._payment_repository = PaymentRepository(self)
        self._revision_repository = RevisionRepository(self)
        self._exchange_rate_repository = ExchangeRateRepository(self)

    def after_commit(self, action: Callable[[], None]) -> None:
        """Run this once the write it belongs to is really on disk.

        The manager announces every change through one door, and it used to
        announce from inside the transaction. That was safe once: the listeners
        only scheduled work, and the work ran after the transaction had closed.
        It stopped being safe when Home Assistant started tasks eagerly —
        `hass.async_create_task` now runs a coroutine up to its first await, so
        the coordinator's re-read was already queued on this very connection
        while the transaction was still open. It read rows that had not
        committed, and might never: a snapshot taken of a write that then rolled
        back told the dashboard a project had gone, and the dashboard took its
        entities down.

        So the announcement waits here rather than every caller remembering to
        send it late — which is the kind of remembering `_record` exists to take
        away. Outside a transaction there is nothing to wait for: the connection
        runs with `isolation_level=None`, so a lone statement has already
        committed by the time anyone could ask.

        The action must not await. It is run with the write behind it and the
        lock released, but on the loop, and anything long here would hold up the
        writer that has just finished.
        """

        if self._owner is not None and self._owner is asyncio.current_task():
            self._after_commit.append(action)

            return

        action()

    @asynccontextmanager
    async def transaction(self) -> AsyncIterator[None]:
        """Execute operations inside a transaction, one writer at a time.

        Nested calls from the same task join the outermost transaction: only it
        commits, and a failure anywhere rolls the whole thing back.

        A call from another task waits its turn. It used to join as well, on a
        depth counter shared by every coroutine on the one connection, and the
        arithmetic was a lottery: `BEGIN` was awaited before the counter went
        up, so two writers starting together both believed they were first. One
        of their `BEGIN`s failed, and whichever left last committed the other's
        unfinished work or rolled it back from under them. Those were the
        sporadic `OperationalError`s — and, before the clock in `coordinator`,
        every one of them left the whole dashboard unavailable for good.

        What `after_commit` was promised goes out once the COMMIT is through,
        and is dropped when there was none. Nothing learns of a write that did
        not happen.
        """

        task = asyncio.current_task()

        if self._owner is not None and self._owner is task:
            # Inside this task's own transaction: nothing to open and nothing to
            # close, the outermost `async with` holds both ends.
            yield

            return

        async with self._lock:
            self._owner = task

            try:
                await self.connection.execute("BEGIN")

                try:
                    yield
                except BaseException:
                    await self.connection.rollback()

                    raise

                await self.connection.commit()
            except BaseException:
                self._after_commit.clear()

                raise
            finally:
                self._owner = None

            # Taken while the lock is still held: the next writer starts
            # promising things of its own the moment it is released, and its
            # promises are not this transaction's to send.
            promised, self._after_commit = self._after_commit, []

        self._speak(promised)

    def _speak(self, promised: list[Callable[[], None]]) -> None:
        """Say what the transaction promised, now that it has happened.

        One listener that throws must not take the others with it, and least of
        all the write: it is committed, and nothing here can un-commit it.
        """

        for action in promised:
            try:
                action()
            except Exception:
                LOGGER.exception("Failed to announce a change that was written")

    async def close(self) -> None:
        """Close the database."""

        if self._connection is not None:
            await self._connection.close()
            self._connection = None
