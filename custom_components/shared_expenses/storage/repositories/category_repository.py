"""Repository for categories."""

from __future__ import annotations

from datetime import datetime

import aiosqlite

from ...helpers.splits import rule_from_json, rule_to_json
from ...models import Category
from .base_repository import BaseRepository

_COLUMNS = """
    id,
    group_id,
    name,
    icon,
    color,
    created_at,
    split_rule
"""


class CategoryRepository(BaseRepository):
    """Repository for managing categories."""

    async def create(self, category: Category) -> None:
        """Create a category."""

        await self._connection.execute(
            """
            INSERT INTO categories (
                id,
                group_id,
                name,
                icon,
                color,
                created_at,
                split_rule
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                category.id,
                category.group_id,
                category.name,
                category.icon,
                category.color,
                category.created_at.isoformat(),
                rule_to_json(category.split_rule),
            ),
        )

    async def get(self, category_id: str) -> Category | None:
        """Return a category."""

        cursor = await self._connection.execute(
            f"""
            SELECT {_COLUMNS}
            FROM categories
            WHERE id = ?
            """,
            (category_id,),
        )

        row = await cursor.fetchone()
        await cursor.close()

        if row is None:
            return None

        return self._from_row(row)

    async def list_by_group(self, group_id: str) -> list[Category]:
        """Return all categories of a group."""

        cursor = await self._connection.execute(
            f"""
            SELECT {_COLUMNS}
            FROM categories
            WHERE group_id = ?
            ORDER BY name
            """,
            (group_id,),
        )

        rows = await cursor.fetchall()
        await cursor.close()

        return [self._from_row(row) for row in rows]

    async def update(self, category: Category) -> None:
        """Update a category."""

        await self._connection.execute(
            """
            UPDATE categories
            SET
                name = ?,
                icon = ?,
                color = ?,
                split_rule = ?
            WHERE id = ?
            """,
            (
                category.name,
                category.icon,
                category.color,
                rule_to_json(category.split_rule),
                category.id,
            ),
        )

    async def delete(self, category_id: str) -> None:
        """Delete a category."""

        await self._connection.execute(
            """
            DELETE FROM categories
            WHERE id = ?
            """,
            (category_id,),
        )

    @staticmethod
    def _from_row(row: aiosqlite.Row) -> Category:
        """Create a Category from a database row."""

        return Category(
            id=row["id"],
            group_id=row["group_id"],
            name=row["name"],
            icon=row["icon"],
            color=row["color"],
            created_at=datetime.fromisoformat(row["created_at"]),
            split_rule=rule_from_json(row["split_rule"]),
        )
