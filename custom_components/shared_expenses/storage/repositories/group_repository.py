"""Repository for groups."""

from __future__ import annotations

from datetime import datetime

import aiosqlite

from ...helpers.splits import rule_from_json, rule_to_json
from ...models import Group
from .base_repository import BaseRepository

_COLUMNS = """
    id,
    name,
    description,
    currency,
    icon,
    color,
    archived,
    created_at,
    split_rule
"""


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
                created_at,
                split_rule
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                rule_to_json(group.split_rule),
            ),
        )

    async def get(self, group_id: str) -> Group | None:
        """Return a group."""

        cursor = await self._connection.execute(
            f"""
            SELECT {_COLUMNS}
            FROM groups
            WHERE id = ?
            """,
            (group_id,),
        )

        row = await cursor.fetchone()
        await cursor.close()

        if row is None:
            return None

        return self._from_row(row)

    async def list_all(self) -> list[Group]:
        """Return all groups."""

        cursor = await self._connection.execute(
            f"""
            SELECT {_COLUMNS}
            FROM groups
            ORDER BY name
            """
        )

        rows = await cursor.fetchall()
        await cursor.close()

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
                archived = ?,
                split_rule = ?
            WHERE id = ?
            """,
            (
                group.name,
                group.description,
                group.currency,
                group.icon,
                group.color,
                int(group.archived),
                rule_to_json(group.split_rule),
                group.id,
            ),
        )

    async def delete(self, group_id: str) -> None:
        """Delete a group."""

        await self._connection.execute(
            """
            DELETE FROM groups
            WHERE id = ?
            """,
            (group_id,),
        )

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
            split_rule=rule_from_json(row["split_rule"]),
        )