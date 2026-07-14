"""Database management for Shared Expenses."""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

import aiosqlite
from homeassistant.core import HomeAssistant

from ..const import DATABASE_NAME
from .migrations import initialize_database
from .repositories.category_repository import CategoryRepository
from .repositories.expense_repository import ExpenseRepository
from .repositories.group_member_repository import GroupMemberRepository
from .repositories.group_repository import GroupRepository
from .repositories.member_repository import MemberRepository
from .repositories.payment_repository import PaymentRepository


class Database:
    """Manage the SQLite database."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the database."""

        self._hass = hass

        self._database_path = Path(hass.config.path(".storage")) / DATABASE_NAME

        self._connection: aiosqlite.Connection | None = None

        self._depth = 0

        self._group_repository: GroupRepository | None = None
        self._member_repository: MemberRepository | None = None
        self._group_member_repository: GroupMemberRepository | None = None
        self._category_repository: CategoryRepository | None = None
        self._expense_repository: ExpenseRepository | None = None
        self._payment_repository: PaymentRepository | None = None

    @property
    def connection(self) -> aiosqlite.Connection:
        """Return the SQLite connection."""

        assert self._connection is not None
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

        self._group_repository = GroupRepository(self.connection)
        self._member_repository = MemberRepository(self.connection)
        self._group_member_repository = GroupMemberRepository(self.connection)
        self._category_repository = CategoryRepository(self.connection)
        self._expense_repository = ExpenseRepository(self.connection)
        self._payment_repository = PaymentRepository(self.connection)

    @asynccontextmanager
    async def transaction(self) -> AsyncIterator[None]:
        """Execute operations inside a transaction.

        Nested calls join the outermost transaction: only it commits, and a
        failure anywhere rolls the whole thing back.
        """

        if self._depth == 0:
            await self.connection.execute("BEGIN")

        self._depth += 1

        try:
            yield
        except Exception:
            self._depth -= 1

            if self._depth == 0:
                await self.connection.rollback()

            raise
        else:
            self._depth -= 1

            if self._depth == 0:
                await self.connection.commit()

    async def close(self) -> None:
        """Close the database."""

        if self._connection is not None:
            await self._connection.close()
            self._connection = None
