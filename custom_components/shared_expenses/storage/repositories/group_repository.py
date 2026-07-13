"""Repository for groups."""

from __future__ import annotations

from datetime import datetime

import aiosqlite

from ...models import Group
from .base_repository import BaseRepository


class GroupRepository(BaseRepository):
    """Repository for managing groups."""

    async def create(self, group: Group) -> None:
        """Create a group."""

        await self._connection.execute(
            """
            INSERT INTO groups (
                id,
                name,
                description,
                currency,
                icon,
                color,
                archived,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                group.id,
                group.name,
                group.description,
                group.currency,
                group.icon,
                group.color,
                int(group.archived),
                group.created_at.isoformat(),
            ),
        )

        await self._connection.commit()

    async def get(self, group_id: str) -> Group | None:
        """Return a group."""

        cursor = await self._connection.execute(
            """
            SELECT *
            FROM groups
            WHERE id = ?
            """,
            (group_id,),
        )

        row = await cursor.fetchone()

        if row is None:
            return None

        return self._from_row(row)

    async def list_all(self) -> list[Group]:
        """Return all groups."""

        cursor = await self._connection.execute(
            """
            SELECT *
            FROM groups
            ORDER BY name
            """
        )

        rows = await cursor.fetchall()

        return [self._from_row(row) for row in rows]

    async def update(self, group: Group) -> None:
        """Update a group."""

        await self._connection.execute(
            """
            UPDATE groups
            SET
                name = ?,
                description = ?,
                currency = ?,
                icon = ?,
                color = ?,
                archived = ?
            WHERE id = ?
            """,
            (
                group.name,
                group.description,
                group.currency,
                group.icon,
                group.color,
                int(group.archived),
                group.id,
            ),
        )

        await self._connection.commit()

    async def delete(self, group_id: str) -> None:
        """Delete a group."""

        await self._connection.execute(
            """
            DELETE FROM groups
            WHERE id = ?
            """,
            (group_id,),
        )

        await self._connection.commit()

    @staticmethod
    def _from_row(row: aiosqlite.Row) -> Group:
        """Create a Group from a database row."""

        return Group(
            id=row["id"],
            name=row["name"],
            description=row["description"],
            currency=row["currency"],
            icon=row["icon"],
            color=row["color"],
            archived=bool(row["archived"]),
            created_at=datetime.fromisoformat(row["created_at"]),
        )