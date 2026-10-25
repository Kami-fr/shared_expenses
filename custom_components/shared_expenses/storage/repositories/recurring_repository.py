"""Repository for recurring expenses."""

from __future__ import annotations

from datetime import date, datetime

import aiosqlite

from ...helpers.splits import rule_from_json, rule_to_json
from ...models import RecurrenceUnit, RecurringExpense
from .base_repository import BaseRepository

_COLUMNS = """
    id,
    group_id,
    category_id,
    title,
    description,
    amount,
    currency,
    paid_by_member_id,
    split_rule,
    every,
    unit,
    anchor,
    next_index,
    ends_on,
    paused,
    announced,
    created_at,
    created_by_member_id
"""


def _day(value: date | None) -> str | None:
    """Store a day as ISO text, or nothing."""

    return None if value is None else value.isoformat()


def _read_day(value: str | None) -> date | None:
    """Read a day stored as ISO text, or nothing."""

    return None if value is None else date.fromisoformat(value)


class RecurringRepository(BaseRepository):
    """Repository for managing recurring expenses."""

    async def create(self, recurring: RecurringExpense) -> None:
        """Create a recurring expense."""

        await self._connection.execute(
            f"""
            INSERT INTO recurring_expenses ({_COLUMNS})
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                recurring.id,
                recurring.group_id,
                recurring.category_id,
                recurring.title,
                recurring.description,
                recurring.amount,
                recurring.currency,
                recurring.paid_by_member_id,
                rule_to_json(recurring.split_rule),
                recurring.every,
                str(recurring.unit),
                recurring.anchor.isoformat(),
                recurring.next_index,
                _day(recurring.ends_on),
                int(recurring.paused),
                _day(recurring.announced),
                recurring.created_at.isoformat(),
                recurring.created_by_member_id,
            ),
        )

    async def get(self, recurring_id: str) -> RecurringExpense | None:
        """Return a recurring expense."""

        cursor = await self._connection.execute(
            f"""
            SELECT {_COLUMNS}
            FROM recurring_expenses
            WHERE id = ?
            """,
            (recurring_id,),
        )

        row = await cursor.fetchone()
        await cursor.close()

        return None if row is None else self._from_row(row)

    async def list_by_group(self, group_id: str) -> list[RecurringExpense]:
        """Return the recurring expenses of a group, in the order they were set up."""

        cursor = await self._connection.execute(
            f"""
            SELECT {_COLUMNS}
            FROM recurring_expenses
            WHERE group_id = ?
            ORDER BY created_at, id
            """,
            (group_id,),
        )

        rows = await cursor.fetchall()
        await cursor.close()

        return [self._from_row(row) for row in rows]

    async def list_all(self) -> list[RecurringExpense]:
        """Return every recurring expense of every group.

        For the morning check, which has no group to start from. A household
        has a handful; reading them all is cheaper than asking which are due.
        """

        cursor = await self._connection.execute(
            f"""
            SELECT {_COLUMNS}
            FROM recurring_expenses
            ORDER BY created_at, id
            """
        )

        rows = await cursor.fetchall()
        await cursor.close()

        return [self._from_row(row) for row in rows]

    async def update(self, recurring: RecurringExpense) -> None:
        """Write back everything that may change.

        Not `group_id`, `created_at` nor `created_by_member_id`: a recurring
        expense does not move between groups, and who set it up is not a thing
        that changes.
        """

        await self._connection.execute(
            """
            UPDATE recurring_expenses
            SET
                category_id = ?,
                title = ?,
                description = ?,
                amount = ?,
                currency = ?,
                paid_by_member_id = ?,
                split_rule = ?,
                every = ?,
                unit = ?,
                anchor = ?,
                next_index = ?,
                ends_on = ?,
                paused = ?,
                announced = ?
            WHERE id = ?
            """,
            (
                recurring.category_id,
                recurring.title,
                recurring.description,
                recurring.amount,
                recurring.currency,
                recurring.paid_by_member_id,
                rule_to_json(recurring.split_rule),
                recurring.every,
                str(recurring.unit),
                recurring.anchor.isoformat(),
                recurring.next_index,
                _day(recurring.ends_on),
                int(recurring.paused),
                _day(recurring.announced),
                recurring.id,
            ),
        )

    async def delete(self, recurring_id: str) -> None:
        """Delete a recurring expense. What it already added stays."""

        await self._connection.execute(
            """
            DELETE FROM recurring_expenses
            WHERE id = ?
            """,
            (recurring_id,),
        )

    @staticmethod
    def _from_row(row: aiosqlite.Row) -> RecurringExpense:
        """Create a RecurringExpense from a database row."""

        return RecurringExpense(
            id=row["id"],
            group_id=row["group_id"],
            category_id=row["category_id"],
            title=row["title"],
            description=row["description"],
            amount=row["amount"],
            currency=row["currency"],
            paid_by_member_id=row["paid_by_member_id"],
            split_rule=rule_from_json(row["split_rule"]),
            every=row["every"],
            unit=RecurrenceUnit(row["unit"]),
            anchor=date.fromisoformat(row["anchor"]),
            next_index=row["next_index"],
            ends_on=_read_day(row["ends_on"]),
            paused=bool(row["paused"]),
            announced=_read_day(row["announced"]),
            created_at=datetime.fromisoformat(row["created_at"]),
            created_by_member_id=row["created_by_member_id"],
        )
