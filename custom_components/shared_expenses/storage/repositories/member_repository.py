"""Repository for members."""

from __future__ import annotations

from datetime import datetime

import aiosqlite

from ...models import Member
from .base_repository import BaseRepository


class MemberRepository(BaseRepository):
    """Repository for managing members."""

    async def create(self, member: Member) -> None:
        """Create a member."""

        await self._connection.execute(
            """
            INSERT INTO members (
                id,
                user_id,
                name,
                color,
                created_at
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                member.id,
                member.user_id,
                member.name,
                member.color,
                member.created_at.isoformat(),
            ),
        )

    async def get(self, member_id: str) -> Member | None:
        """Return a member."""

        cursor = await self._connection.execute(
            """
            SELECT
                id,
                user_id,
                name,
                color,
                created_at
            FROM members
            WHERE id = ?
            """,
            (member_id,),
        )

        row = await cursor.fetchone()
        await cursor.close()

        if row is None:
            return None

        return self._from_row(row)

    async def list_all(self) -> list[Member]:
        """Return all members."""

        cursor = await self._connection.execute(
            """
            SELECT
                id,
                user_id,
                name,
                color,
                created_at
            FROM members
            ORDER BY name
            """
        )

        rows = await cursor.fetchall()
        await cursor.close()

        return [self._from_row(row) for row in rows]

    async def get_by_user_id(self, user_id: str) -> Member | None:
        """Return the member backing a Home Assistant account."""

        cursor = await self._connection.execute(
            """
            SELECT
                id,
                user_id,
                name,
                color,
                created_at
            FROM members
            WHERE user_id = ?
            """,
            (user_id,),
        )

        row = await cursor.fetchone()
        await cursor.close()

        if row is None:
            return None

        return self._from_row(row)

    async def shares_group_with_user(self, member_id: str, user_id: str) -> bool:
        """Return whether an account and a member share an active group.

        This is what lets someone edit a member: you may only touch people you
        actually share a group with.
        """

        cursor = await self._connection.execute(
            """
            SELECT 1
            FROM group_members AS theirs
            INNER JOIN group_members AS mine
                ON mine.group_id = theirs.group_id AND mine.left_at IS NULL
            INNER JOIN members AS me ON me.id = mine.member_id
            WHERE theirs.member_id = ?
              AND theirs.left_at IS NULL
              AND me.user_id = ?
            LIMIT 1
            """,
            (member_id, user_id),
        )

        row = await cursor.fetchone()
        await cursor.close()

        return row is not None

    async def list_by_group(
        self,
        group_id: str,
        *,
        include_left: bool = False,
    ) -> list[Member]:
        """Return the members of a group."""

        condition = "" if include_left else "AND group_members.left_at IS NULL"

        cursor = await self._connection.execute(
            f"""
            SELECT DISTINCT
                members.id,
                members.user_id,
                members.name,
                members.color,
                members.created_at
            FROM members
            INNER JOIN group_members ON group_members.member_id = members.id
            WHERE group_members.group_id = ? {condition}
            ORDER BY members.name
            """,
            (group_id,),
        )

        rows = await cursor.fetchall()
        await cursor.close()

        return [self._from_row(row) for row in rows]

    async def update(self, member: Member) -> None:
        """Update a member."""

        await self._connection.execute(
            """
            UPDATE members
            SET
                user_id = ?,
                name = ?,
                color = ?
            WHERE id = ?
            """,
            (
                member.user_id,
                member.name,
                member.color,
                member.id,
            ),
        )

    async def delete(self, member_id: str) -> None:
        """Delete a member."""

        await self._connection.execute(
            """
            DELETE FROM members
            WHERE id = ?
            """,
            (member_id,),
        )

    @staticmethod
    def _from_row(row: aiosqlite.Row) -> Member:
        """Create a Member from a database row."""

        return Member(
            id=row["id"],
            user_id=row["user_id"],
            name=row["name"],
            color=row["color"],
            created_at=datetime.fromisoformat(row["created_at"]),
        )