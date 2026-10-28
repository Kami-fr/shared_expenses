"""Repository for the checks somebody answered "this is right"."""

from __future__ import annotations

from datetime import datetime

from .base_repository import BaseRepository


class CheckRepository(BaseRepository):
    """Repository for dismissed checks."""

    async def list_by_group(self, group_id: str) -> list[tuple[str, str]]:
        """Return the (kind, key) of every check dismissed in a group."""

        async with self._connection.execute(
            """
            SELECT kind, key
            FROM check_dismissals
            WHERE group_id = ?
            ORDER BY dismissed_at
            """,
            (group_id,),
        ) as cursor:
            rows = await cursor.fetchall()

        return [(row["kind"], row["key"]) for row in rows]

    async def dismiss(
        self,
        group_id: str,
        kind: str,
        key: str,
        dismissed_at: datetime,
        member_id: str | None,
    ) -> None:
        """Keep a check as answered. Answering it twice keeps the first answer."""

        await self._connection.execute(
            """
            INSERT OR IGNORE INTO check_dismissals (
                group_id,
                kind,
                key,
                dismissed_at,
                dismissed_by_member_id
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (group_id, kind, key, dismissed_at.isoformat(), member_id),
        )
