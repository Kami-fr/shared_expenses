"""Tests for the one connection, and for when it says what it wrote.

Everything this integration stores goes through a single SQLite connection, and
for a while everything writing to it at once shared a single transaction. The
depth counter was raised after the `BEGIN` was awaited, so two writers starting
together both believed they were first; whichever left last committed the
other's unfinished work, or rolled it back from under them.

And every change was announced before the COMMIT, to listeners Home Assistant
now starts eagerly — so the coordinator re-read this very connection while the
transaction was still open, and once kept a snapshot of a write that was then
undone.

Both are why a dashboard full of tiles went unavailable and stayed there. Both
are testable here: no Home Assistant, one real database.
"""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime
from pathlib import Path

import aiosqlite
import pytest

from custom_components.shared_expenses.const import DATABASE_NAME
from custom_components.shared_expenses.exceptions import DatabaseNotReadyError
from custom_components.shared_expenses.models import Member
from custom_components.shared_expenses.storage.database import Database
from tests.conftest import FakeHass

NOW = datetime(2026, 7, 14, 12, 0, tzinfo=UTC)


def a_member(member_id: str) -> Member:
    """Return somebody to write, which is all these tests need written."""

    return Member(
        id=member_id,
        user_id=None,
        name=member_id,
        color=None,
        created_at=NOW,
    )


async def write(database: Database, member_id: str) -> None:
    """Write one member inside a transaction of its own."""

    async with database.transaction():
        await database.member_repository.create(a_member(member_id))


async def ids(database: Database) -> set[str]:
    """Return who is in the database now."""

    return {member.id for member in await database.member_repository.list_all()}


#
# One connection, one writer at a time
#


async def test_two_writers_both_land(database: Database) -> None:
    """The plainest form of the bug: two transactions, one connection.

    Both used to issue their own `BEGIN`, because the depth counter went up only
    after the first one had been awaited. One of them failed with `cannot start
    a transaction within a transaction`, and a failure anywhere in here took the
    whole dashboard down with it.
    """

    await asyncio.gather(write(database, "m1"), write(database, "m2"))

    assert await ids(database) == {"m1", "m2"}


async def test_a_failed_write_does_not_take_a_concurrent_one_with_it(
    database: Database,
) -> None:
    """The expensive form. One writer rolled back, and the other lost its work.

    They shared a transaction, so a `ROLLBACK` meant for one undid whatever the
    other had finished — silently, with the caller told it had succeeded.
    """

    async def doomed() -> None:
        async with database.transaction():
            await database.member_repository.create(a_member("doomed"))

            # Long enough for the other writer to run to the end.
            await asyncio.sleep(0)

            raise RuntimeError("no")

    results = await asyncio.gather(
        doomed(),
        write(database, "kept"),
        return_exceptions=True,
    )

    assert isinstance(results[0], RuntimeError)
    assert results[1] is None

    assert await ids(database) == {"kept"}


async def test_a_nested_transaction_joins_the_one_it_is_in(
    database: Database,
) -> None:
    """The same task nesting must not wait on itself, and must not commit early.

    Half the manager's writes call another method that opens a transaction of
    its own. Joining is the whole reason this is not a plain lock.
    """

    async with database.transaction():
        await database.member_repository.create(a_member("outer"))

        async with database.transaction():
            await database.member_repository.create(a_member("inner"))

        # Still inside the outermost one, so nothing has been committed and
        # nothing is stuck: the next statement runs.
        await database.member_repository.create(a_member("after"))

    assert await ids(database) == {"outer", "inner", "after"}


async def test_a_failure_inside_a_nested_transaction_undoes_all_of_it(
    database: Database,
) -> None:
    """Only the outermost commits, so only the outermost may roll back."""

    with pytest.raises(RuntimeError):
        async with database.transaction():
            await database.member_repository.create(a_member("outer"))

            async with database.transaction():
                await database.member_repository.create(a_member("inner"))

                raise RuntimeError("no")

    assert await ids(database) == set()


#
# What is said, and when
#


async def test_nothing_is_announced_before_the_write_lands(
    database: Database,
) -> None:
    """The announcement waits for the COMMIT, and the COMMIT is the last thing.

    It used to go out from inside the transaction, on the reasoning that the
    listeners only scheduled work for later. Home Assistant starts tasks
    eagerly now, so "later" became "on the next await, still in here".
    """

    said: list[str] = []

    async with database.transaction():
        database.after_commit(lambda: said.append("moved"))

        await database.member_repository.create(a_member("m1"))

        assert said == [], "announced a write that had not happened yet"

    assert said == ["moved"]


async def test_a_write_that_rolls_back_announces_nothing(
    database: Database,
) -> None:
    """The one that cost the tiles their entities.

    A group read mid-transaction and then rolled back looked deleted, and a
    project that looks deleted used to have its device taken down — with every
    tile pointing at it left pointing at nothing.
    """

    said: list[str] = []

    with pytest.raises(RuntimeError):
        async with database.transaction():
            database.after_commit(lambda: said.append("moved"))

            await database.member_repository.create(a_member("m1"))

            raise RuntimeError("no")

    assert said == []
    assert await ids(database) == set()


async def test_what_is_announced_can_already_be_read(
    hass: FakeHass,
    database: Database,
) -> None:
    """Proof of the COMMIT rather than of the order the code is written in.

    Read back over a second connection, which sees only what is on disk. The
    integration's own connection would have shown its own uncommitted rows and
    proved nothing at all.
    """

    seen: list[set[str]] = []
    started: list[asyncio.Task[None]] = []

    path = Path(hass.config.path(".storage")) / DATABASE_NAME

    async def read_from_outside() -> None:
        async with aiosqlite.connect(path) as other:
            cursor = await other.execute("SELECT id FROM members")
            seen.append({row[0] for row in await cursor.fetchall()})

    # What a real listener does: it does not read here, it goes away and reads.
    async with database.transaction():
        database.after_commit(
            lambda: started.append(asyncio.ensure_future(read_from_outside()))
        )

        await database.member_repository.create(a_member("m1"))

    await asyncio.gather(*started)

    assert seen == [{"m1"}]


async def test_an_announcement_outside_a_transaction_is_sent_at_once(
    database: Database,
) -> None:
    """`delete_group` is the one write that journals nothing and speaks anyway.

    It never opens a transaction, so there is nothing to wait for: the
    connection runs in autocommit, and its statement has already landed.
    """

    said: list[str] = []

    database.after_commit(lambda: said.append("moved"))

    assert said == ["moved"]


async def test_a_listener_that_throws_does_not_stop_the_others(
    database: Database,
) -> None:
    """The write is committed and nothing here can un-commit it.

    So one bad listener costs its own message and no more — least of all the
    coordinator's, which is what puts the figures back on the wall.
    """

    said: list[str] = []

    def _bad() -> None:
        raise RuntimeError("no")

    async with database.transaction():
        database.after_commit(_bad)
        database.after_commit(lambda: said.append("moved"))

        await database.member_repository.create(a_member("m1"))

    assert said == ["moved"]
    assert await ids(database) == {"m1"}


#
# What a closed database says
#


async def test_a_closed_database_says_so_in_every_build(
    database: Database,
) -> None:
    """It was an `assert`, and `python -O` compiles those out.

    What it guards is a moment rather than a mistake — a read still in flight
    when the entry unloads — so it has to fail the same way in every build, and
    as something the coordinator recognises.
    """

    await database.close()

    with pytest.raises(DatabaseNotReadyError):
        _ = database.connection
