"""Repository for expenses."""

from __future__ import annotations

from datetime import datetime

import aiosqlite

from ...helpers.splits import rule_from_json, rule_to_json
from ...models import Expense, ExpenseShare
from .base_repository import BaseRepository


class ExpenseRepository(BaseRepository):
    """Repository for managing expenses."""

    async def create(
        self,
        expense: Expense,
        shares: list[ExpenseShare],
    ) -> None:
        """Create an expense and its shares."""

        await self._connection.execute(
            """
            INSERT INTO expenses (
                id,
                group_id,
                category_id,
                title,
                description,
                amount,
                currency,
                paid_by_member_id,
                expense_date,
                created_at,
                split_rule
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                expense.id,
                expense.group_id,
                expense.category_id,
                expense.title,
                expense.description,
                expense.amount,
                expense.currency,
                expense.paid_by_member_id,
                expense.expense_date.isoformat(),
                expense.created_at.isoformat(),
                rule_to_json(expense.split_rule),
            ),
        )

        for share in shares:
            await self._connection.execute(
                """
                INSERT INTO expense_shares (
                    id,
                    expense_id,
                    member_id,
                    amount,
                    created_at
                )
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    share.id,
                    share.expense_id,
                    share.member_id,
                    share.amount,
                    share.created_at.isoformat(),
                ),
            )

    async def get(self, expense_id: str) -> Expense | None:
        """Return an expense."""

        cursor = await self._connection.execute(
            """
            SELECT
                id,
                group_id,
                category_id,
                title,
                description,
                amount,
                currency,
                paid_by_member_id,
                expense_date,
                created_at,
                split_rule
            FROM expenses
            WHERE id = ?
            """,
            (expense_id,),
        )

        row = await cursor.fetchone()
        await cursor.close()

        if row is None:
            return None

        return self._from_row(row)

    async def list_by_group(self, group_id: str) -> list[Expense]:
        """Return all expenses for a group."""

        cursor = await self._connection.execute(
            """
            SELECT
                id,
                group_id,
                category_id,
                title,
                description,
                amount,
                currency,
                paid_by_member_id,
                expense_date,
                created_at,
                split_rule
            FROM expenses
            WHERE group_id = ?
            -- A date input carries no time, so everything entered on the same
            -- day shares one expense_date: created_at breaks the tie.
            ORDER BY expense_date DESC, created_at DESC
            """,
            (group_id,),
        )

        rows = await cursor.fetchall()
        await cursor.close()

        return [self._from_row(row) for row in rows]

    async def get_shares(
        self,
        expense_id: str,
    ) -> list[ExpenseShare]:
        """Return the shares of an expense."""

        cursor = await self._connection.execute(
            """
            SELECT
                id,
                expense_id,
                member_id,
                amount,
                created_at
            FROM expense_shares
            WHERE expense_id = ?
            ORDER BY member_id
            """,
            (expense_id,),
        )

        rows = await cursor.fetchall()
        await cursor.close()

        return [self._share_from_row(row) for row in rows]

    async def list_shares_by_group(self, group_id: str) -> list[ExpenseShare]:
        """Return the shares of every expense of a group."""

        cursor = await self._connection.execute(
            """
            SELECT
                expense_shares.id,
                expense_shares.expense_id,
                expense_shares.member_id,
                expense_shares.amount,
                expense_shares.created_at
            FROM expense_shares
            INNER JOIN expenses ON expenses.id = expense_shares.expense_id
            WHERE expenses.group_id = ?
            """,
            (group_id,),
        )

        rows = await cursor.fetchall()
        await cursor.close()

        return [self._share_from_row(row) for row in rows]

    async def update(
        self,
        expense: Expense,
        shares: list[ExpenseShare],
    ) -> None:
        """Update an expense."""

        await self._connection.execute(
            """
            UPDATE expenses
            SET
                category_id = ?,
                title = ?,
                description = ?,
                amount = ?,
                currency = ?,
                paid_by_member_id = ?,
                expense_date = ?,
                split_rule = ?
            WHERE id = ?
            """,
            (
                expense.category_id,
                expense.title,
                expense.description,
                expense.amount,
                expense.currency,
                expense.paid_by_member_id,
                expense.expense_date.isoformat(),
                rule_to_json(expense.split_rule),
                expense.id,
            ),
        )

        await self._connection.execute(
            """
            DELETE FROM expense_shares
            WHERE expense_id = ?
            """,
            (expense.id,),
        )

        for share in shares:
            await self._connection.execute(
                """
                INSERT INTO expense_shares (
                    id,
                    expense_id,
                    member_id,
                    amount,
                    created_at
                )
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    share.id,
                    share.expense_id,
                    share.member_id,
                    share.amount,
                    share.created_at.isoformat(),
                ),
            )

    async def delete(self, expense_id: str) -> None:
        """Delete an expense."""

        await self._connection.execute(
            """
            DELETE FROM expenses
            WHERE id = ?
            """,
            (expense_id,),
        )

    @staticmethod
    def _share_from_row(row: aiosqlite.Row) -> ExpenseShare:
        """Create an ExpenseShare from a database row."""

        return ExpenseShare(
            id=row["id"],
            expense_id=row["expense_id"],
            member_id=row["member_id"],
            amount=row["amount"],
            created_at=datetime.fromisoformat(row["created_at"]),
        )

    @staticmethod
    def _from_row(row: aiosqlite.Row) -> Expense:
        """Create an Expense from a database row."""

        return Expense(
            id=row["id"],
            group_id=row["group_id"],
            category_id=row["category_id"],
            title=row["title"],
            description=row["description"],
            amount=row["amount"],
            currency=row["currency"],
            paid_by_member_id=row["paid_by_member_id"],
            expense_date=datetime.fromisoformat(row["expense_date"]),
            created_at=datetime.fromisoformat(row["created_at"]),
            split_rule=rule_from_json(row["split_rule"]),
        )