"""Repository for groups."""

from __future__ import annotations

from datetime import datetime

import aiosqlite

from ...helpers.splits import rule_from_json, rule_to_json
from ...models import Group, Permission
from .base_repository import BaseRepository

#: The column each permission is granted by, in the order they are written.
#:
#: One column apiece rather than a list in a blob: the schema is where the shape
#: of this integration is written down, and a permission nobody can see by
#: reading it is a permission nobody will remember to check.
_PERMISSION_COLUMNS: dict[Permission, str] = {
    Permission.MANAGE_MEMBERS: "allow_manage_members",
    Permission.MANAGE_CATEGORIES: "allow_manage_categories",
    Permission.MANAGE_GROUP: "allow_manage_group",
    Permission.EDIT_OTHERS: "allow_edit_others",
}

_COLUMNS = f"""
    id,
    name,
    description,
    currency,
    icon,
    color,
    archived,
    created_at,
    split_rule,
    default_category_id,
    {", ".join(_PERMISSION_COLUMNS.values())}
"""

# `members` also carries id, name, color and created_at, so a join needs the
# columns spelled out or SQLite refuses them as ambiguous.
_JOINED_COLUMNS = f"""
    groups.id,
    groups.name,
    groups.description,
    groups.currency,
    groups.icon,
    groups.color,
    groups.archived,
    groups.created_at,
    groups.split_rule,
    groups.default_category_id,
    {", ".join(f"groups.{column}" for column in _PERMISSION_COLUMNS.values())}
"""


class GroupRepository(BaseRepository):
    """Repository for managing groups."""

    async def create(self, group: Group) -> None:
        """Create a group."""

        columns = ", ".join(_PERMISSION_COLUMNS.values())
        placeholders = ", ".join("?" for _ in _PERMISSION_COLUMNS)

        await self._connection.execute(
            f"""
            INSERT INTO groups (
                id,
                name,
                description,
                currency,
                icon,
                color,
                archived,
                created_at,
                split_rule,
                default_category_id,
                {columns}
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, {placeholders})
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
                group.default_category_id,
                *_permission_values(group),
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

    async def list_by_user(self, user_id: str) -> list[Group]:
        """Return the groups a Home Assistant account is an active member of.

        This is what walls the panel off: a user never learns that the other
        groups exist.
        """

        cursor = await self._connection.execute(
            f"""
            SELECT DISTINCT {_JOINED_COLUMNS}
            FROM groups
            INNER JOIN group_members ON group_members.group_id = groups.id
            INNER JOIN members ON members.id = group_members.member_id
            WHERE members.user_id = ? AND group_members.left_at IS NULL
            ORDER BY groups.name
            """,
            (user_id,),
        )

        rows = await cursor.fetchall()
        await cursor.close()

        return [self._from_row(row) for row in rows]

    async def is_member(self, group_id: str, user_id: str) -> bool:
        """Return whether an account is an active member of a group."""

        cursor = await self._connection.execute(
            """
            SELECT 1
            FROM group_members
            INNER JOIN members ON members.id = group_members.member_id
            WHERE group_members.group_id = ?
              AND members.user_id = ?
              AND group_members.left_at IS NULL
            LIMIT 1
            """,
            (group_id, user_id),
        )

        row = await cursor.fetchone()
        await cursor.close()

        return row is not None

    async def update(self, group: Group) -> None:
        """Update a group."""

        assignments = ", ".join(
            f"{column} = ?" for column in _PERMISSION_COLUMNS.values()
        )

        await self._connection.execute(
            f"""
            UPDATE groups
            SET
                name = ?,
                description = ?,
                currency = ?,
                icon = ?,
                color = ?,
                archived = ?,
                split_rule = ?,
                default_category_id = ?,
                {assignments}
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
                group.default_category_id,
                *_permission_values(group),
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
            default_category_id=row["default_category_id"],
            permissions=frozenset(
                permission
                for permission, column in _PERMISSION_COLUMNS.items()
                if row[column]
            ),
        )


def _permission_values(group: Group) -> tuple[int, ...]:
    """Return the permission columns of a group, in the order they are written."""

    return tuple(
        int(permission in group.permissions) for permission in _PERMISSION_COLUMNS
    )