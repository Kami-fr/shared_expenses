"""Repository for group members."""

from __future__ import annotations

from datetime import datetime

import aiosqlite

from ...models import GroupMember
from ...models.enums.group_role import GroupRole
from .base_repository import BaseRepository


class GroupMemberRepository(BaseRepository):
    """Repository for managing group members."""

    async def create(self, group_member: GroupMember) -> None:
        """Create a group member."""

        await self._connection.execute(
            """
            INSERT INTO group_members (
                id,
                group_id,
                member_id,
                role,
                joined_at,
                left_at,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                group_member.id,
                group_member.group_id,
                group_member.member_id,
                group_member.role.value,
                group_member.joined_at.isoformat(),
                (
                    group_member.left_at.isoformat()
                    if group_member.left_at is not None
                    else None
                ),
                group_member.created_at.isoformat(),
            ),
        )

    async def get(self, group_member_id: str) -> GroupMember | None:
        """Return a group member."""

        cursor = await self._connection.execute(
            """
            SELECT
                id,
                group_id,
                member_id,
                role,
                joined_at,
                left_at,
                created_at
            FROM group_members
            WHERE id = ?
            """,
            (group_member_id,),
        )

        row = await cursor.fetchone()
        await cursor.close()

        if row is None:
            return None

        return self._from_row(row)

    async def list_by_group(self, group_id: str) -> list[GroupMember]:
        """Return all members of a group."""

        cursor = await self._connection.execute(
            """
            SELECT
                id,
                group_id,
                member_id,
                role,
                joined_at,
                left_at,
                created_at
            FROM group_members
            WHERE group_id = ?
            ORDER BY joined_at
            """,
            (group_id,),
        )

        rows = await cursor.fetchall()
        await cursor.close()

        return [self._from_row(row) for row in rows]

    async def update(self, group_member: GroupMember) -> None:
        """Update a group member."""

        await self._connection.execute(
            """
            UPDATE group_members
            SET
                role = ?,
                joined_at = ?,
                left_at = ?
            WHERE id = ?
            """,
            (
                group_member.role.value,
                group_member.joined_at.isoformat(),
                (
                    group_member.left_at.isoformat()
                    if group_member.left_at is not None
                    else None
                ),
                group_member.id,
            ),
        )

    async def delete(self, group_member_id: str) -> None:
        """Delete a group member."""

        await self._connection.execute(
            """
            DELETE FROM group_members
            WHERE id = ?
            """,
            (group_member_id,),
        )

    @staticmethod
    def _from_row(row: aiosqlite.Row) -> GroupMember:
        """Create a GroupMember from a database row."""

        return GroupMember(
            id=row["id"],
            group_id=row["group_id"],
            member_id=row["member_id"],
            role=GroupRole(row["role"]),
            joined_at=datetime.fromisoformat(row["joined_at"]),
            left_at=(
                datetime.fromisoformat(row["left_at"])
                if row["left_at"] is not None
                else None
            ),
            created_at=datetime.fromisoformat(row["created_at"]),
        )