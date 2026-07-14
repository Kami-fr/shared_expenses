"""Repository for exchange rates."""

from __future__ import annotations

from datetime import date, datetime

import aiosqlite

from ...models import ExchangeRate, RateSource
from .base_repository import BaseRepository

_COLUMNS = """
    id,
    base,
    quote,
    rate,
    as_of,
    source,
    created_at
"""


class ExchangeRateRepository(BaseRepository):
    """Repository for the rates ever seen, from the source or by hand."""

    async def upsert(self, rate: ExchangeRate) -> None:
        """Record a rate, replacing whatever was known for that pair and day.

        One rate per pair per day: fetching the same day twice must not stack
        rows, and a fetch that succeeds is worth more than the hand-typed one it
        replaces — that was only ever a stand-in for it.
        """

        await self._connection.execute(
            """
            INSERT INTO exchange_rates (
                id,
                base,
                quote,
                rate,
                as_of,
                source,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(base, quote, as_of) DO UPDATE SET
                rate = excluded.rate,
                source = excluded.source,
                created_at = excluded.created_at
            """,
            (
                rate.id,
                rate.base,
                rate.quote,
                rate.rate,
                rate.as_of.isoformat(),
                str(rate.source),
                rate.created_at.isoformat(),
            ),
        )

    async def get(self, base: str, quote: str, as_of: date) -> ExchangeRate | None:
        """Return the rate known for a pair on a given day, if any."""

        cursor = await self._connection.execute(
            f"""
            SELECT {_COLUMNS}
            FROM exchange_rates
            WHERE base = ? AND quote = ? AND as_of = ?
            """,
            (base, quote, as_of.isoformat()),
        )

        row = await cursor.fetchone()
        await cursor.close()

        return None if row is None else self._from_row(row)

    async def latest(self, base: str, quote: str) -> ExchangeRate | None:
        """Return the most recent rate known for a pair.

        What a fallback asks for. It carries its own date, so whoever is offered
        it can see how old it is and refuse.
        """

        cursor = await self._connection.execute(
            f"""
            SELECT {_COLUMNS}
            FROM exchange_rates
            WHERE base = ? AND quote = ?
            ORDER BY as_of DESC
            LIMIT 1
            """,
            (base, quote),
        )

        row = await cursor.fetchone()
        await cursor.close()

        return None if row is None else self._from_row(row)

    @staticmethod
    def _from_row(row: aiosqlite.Row) -> ExchangeRate:
        """Create an ExchangeRate from a database row."""

        return ExchangeRate(
            id=row["id"],
            base=row["base"],
            quote=row["quote"],
            rate=row["rate"],
            as_of=date.fromisoformat(row["as_of"]),
            source=RateSource(row["source"]),
            created_at=datetime.fromisoformat(row["created_at"]),
        )
