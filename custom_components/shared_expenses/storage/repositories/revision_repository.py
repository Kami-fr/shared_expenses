"""Repository for revisions."""

from __future__ import annotations

from datetime import datetime
import json

import aiosqlite

from ...models import FieldChange, Revision, RevisionAction, RevisionEntity
from .base_repository import BaseRepository

_COLUMNS = """
    id,
    group_id,
    entity_type,
    entity_id,
    entity_label,
    action,
    actor_user_id,
    changes,
    at
"""


class RevisionRepository(BaseRepository):
    """Repository for reading and appending revisions.

    Append-only by design: there is no update, and no delete other than the
    cascade that takes a whole group. A history that can be edited answers
    nothing.
    """

    async def create(self, revision: Revision) -> None:
        """Record a revision."""

        await self._connection.execute(
            """
            INSERT INTO revisions (
                id,
                group_id,
                entity_type,
                entity_id,
                entity_label,
                action,
                actor_user_id,
                changes,
                at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                revision.id,
                revision.group_id,
                str(revision.entity_type),
                revision.entity_id,
                revision.entity_label,
                str(revision.action),
                revision.actor_user_id,
                _changes_to_json(revision.changes),
                revision.at.isoformat(),
            ),
        )

    async def list_by_group(self, group_id: str, limit: int) -> list[Revision]:
        """Return the group's history, newest first."""

        cursor = await self._connection.execute(
            f"""
            SELECT {_COLUMNS}
            FROM revisions
            WHERE group_id = ?
            ORDER BY at DESC, id DESC
            LIMIT ?
            """,
            (group_id, limit),
        )

        rows = await cursor.fetchall()
        await cursor.close()

        return [self._from_row(row) for row in rows]

    async def has_deletion(self, group_id: str, *entity_types: RevisionEntity) -> bool:
        """Return whether the group ever put away one of these kinds of thing.

        A deletion is the last place what it took still exists, and a restore is
        built from it — so this answers whether anything could still come back.
        Asked rather than listed: what is wanted is a yes or a no, and a group's
        whole history is a long way to go for one.
        """

        kinds = ", ".join("?" for _ in entity_types)

        cursor = await self._connection.execute(
            f"""
            SELECT 1
            FROM revisions
            WHERE group_id = ?
              AND action = ?
              AND entity_type IN ({kinds})
            LIMIT 1
            """,
            (
                group_id,
                str(RevisionAction.DELETED),
                *(str(entity_type) for entity_type in entity_types),
            ),
        )

        row = await cursor.fetchone()
        await cursor.close()

        return row is not None

    async def list_by_entity(self, entity_id: str) -> list[Revision]:
        """Return the history of one expense or payment, newest first."""

        cursor = await self._connection.execute(
            f"""
            SELECT {_COLUMNS}
            FROM revisions
            WHERE entity_id = ?
            ORDER BY at DESC, id DESC
            """,
            (entity_id,),
        )

        rows = await cursor.fetchall()
        await cursor.close()

        return [self._from_row(row) for row in rows]

    @staticmethod
    def _from_row(row: aiosqlite.Row) -> Revision:
        """Create a Revision from a database row."""

        return Revision(
            id=row["id"],
            group_id=row["group_id"],
            entity_type=RevisionEntity(row["entity_type"]),
            entity_id=row["entity_id"],
            entity_label=row["entity_label"],
            action=RevisionAction(row["action"]),
            actor_user_id=row["actor_user_id"],
            changes=_changes_from_json(row["changes"]),
            at=datetime.fromisoformat(row["at"]),
        )


def _changes_to_json(changes: tuple[FieldChange, ...]) -> str:
    """Serialize the changes of a revision."""

    return json.dumps(
        [
            {"field": change.field, "before": change.before, "after": change.after}
            for change in changes
        ]
    )


def _changes_from_json(raw: str) -> tuple[FieldChange, ...]:
    """Read back the changes of a revision."""

    return tuple(
        FieldChange(
            field=item["field"],
            before=item.get("before"),
            after=item.get("after"),
        )
        for item in json.loads(raw)
    )
