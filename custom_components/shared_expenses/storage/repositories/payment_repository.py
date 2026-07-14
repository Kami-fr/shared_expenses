"""Repository for payments."""

from __future__ import annotations

from datetime import date, datetime

import aiosqlite

from ...models import Payment, PaymentKind
from .base_repository import BaseRepository

_COLUMNS = """
    id,
    group_id,
    description,
    from_member_id,
    to_member_id,
    amount,
    currency,
    payment_date,
    created_at,
    kind,
    converted_amount,
    exchange_rate,
    rate_as_of
"""


class PaymentRepository(BaseRepository):
    """Repository for managing payments."""

    async def create(self, payment: Payment) -> None:
        """Create a payment."""

        await self._connection.execute(
            """
            INSERT INTO payments (
                id,
                group_id,
                description,
                from_member_id,
                to_member_id,
                amount,
                currency,
                payment_date,
                created_at,
                kind,
                converted_amount,
                exchange_rate,
                rate_as_of
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payment.id,
                payment.group_id,
                payment.description,
                payment.from_member_id,
                payment.to_member_id,
                payment.amount,
                payment.currency,
                payment.payment_date.isoformat(),
                payment.created_at.isoformat(),
                str(payment.kind),
                payment.converted_amount,
                payment.exchange_rate,
                payment.rate_as_of.isoformat() if payment.rate_as_of else None,
            ),
        )

    async def get(self, payment_id: str) -> Payment | None:
        """Return a payment."""

        cursor = await self._connection.execute(
            f"""
            SELECT {_COLUMNS}
            FROM payments
            WHERE id = ?
            """,
            (payment_id,),
        )

        row = await cursor.fetchone()
        await cursor.close()

        if row is None:
            return None

        return self._from_row(row)

    async def list_by_group(self, group_id: str) -> list[Payment]:
        """Return all payments of a group."""

        cursor = await self._connection.execute(
            f"""
            SELECT {_COLUMNS}
            FROM payments
            WHERE group_id = ?
            ORDER BY payment_date DESC, created_at DESC
            """,
            (group_id,),
        )

        rows = await cursor.fetchall()
        await cursor.close()

        return [self._from_row(row) for row in rows]

    async def update(self, payment: Payment) -> None:
        """Update a payment."""

        await self._connection.execute(
            """
            UPDATE payments
            SET
                description = ?,
                from_member_id = ?,
                to_member_id = ?,
                amount = ?,
                currency = ?,
                payment_date = ?,
                kind = ?,
                converted_amount = ?,
                exchange_rate = ?,
                rate_as_of = ?
            WHERE id = ?
            """,
            (
                payment.description,
                payment.from_member_id,
                payment.to_member_id,
                payment.amount,
                payment.currency,
                payment.payment_date.isoformat(),
                str(payment.kind),
                payment.converted_amount,
                payment.exchange_rate,
                payment.rate_as_of.isoformat() if payment.rate_as_of else None,
                payment.id,
            ),
        )

    async def delete(self, payment_id: str) -> None:
        """Delete a payment."""

        await self._connection.execute(
            """
            DELETE FROM payments
            WHERE id = ?
            """,
            (payment_id,),
        )

    @staticmethod
    def _from_row(row: aiosqlite.Row) -> Payment:
        """Create a Payment from a database row."""

        return Payment(
            id=row["id"],
            group_id=row["group_id"],
            description=row["description"],
            from_member_id=row["from_member_id"],
            to_member_id=row["to_member_id"],
            amount=row["amount"],
            currency=row["currency"],
            payment_date=datetime.fromisoformat(row["payment_date"]),
            created_at=datetime.fromisoformat(row["created_at"]),
            kind=PaymentKind(row["kind"]),
            converted_amount=row["converted_amount"],
            exchange_rate=row["exchange_rate"],
            rate_as_of=(
                date.fromisoformat(row["rate_as_of"]) if row["rate_as_of"] else None
            ),
        )
