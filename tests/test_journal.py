"""Tests for what the project's journal accounts for beyond the money.

The history was the expenses and the payments, and nothing else. So the things
that decide who may touch them — who is in the project, what it allows, who runs
it — happened with no record at all: the one change worth explaining afterwards
was the one nothing wrote down.

Driven through the real commands, because the actor is the point. A revision
recorded by a manager nobody calls through the front door would name nobody.
"""

from __future__ import annotations

from dataclasses import replace
from datetime import UTC, datetime
from typing import Any

from custom_components.shared_expenses.manager import SharedExpensesManager
from custom_components.shared_expenses.models import (
    Permission,
    RevisionAction,
    RevisionEntity,
)
from custom_components.shared_expenses.websocket import categories, groups, members
from tests.conftest import ADMIN, PLAIN, FakeConnection, FakeHass, send

NOW = datetime(2026, 7, 14, 12, 0, tzinfo=UTC)


async def journal(
    manager: SharedExpensesManager,
    project: dict[str, Any],
    entity: RevisionEntity | None = None,
) -> list[Any]:
    """Return the project's journal, newest first, optionally of one kind."""

    found = await manager.list_revisions(project["group"].id)

    if entity is None:
        return found

    return [revision for revision in found if revision.entity_type is entity]


def moved(revision: Any, field: str) -> Any:
    """Return the change to one field, or None when it did not move."""

    return next((c for c in revision.changes if c.field == field), None)


#
# The project itself
#


async def test_changing_the_permissions_is_recorded(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """The change that decides every other one, and it went unwritten."""

    connection = FakeConnection(ADMIN)

    await send(
        loaded,
        connection,
        groups.websocket_update_group,
        {
            "group_id": project["group"].id,
            "permissions": [str(Permission.MANAGE_CATEGORIES)],
        },
    )

    assert connection.errors == {}

    entries = await journal(manager, project, RevisionEntity.GROUP)

    assert len(entries) == 1
    assert entries[0].action is RevisionAction.UPDATED
    assert entries[0].actor_user_id == ADMIN

    change = moved(entries[0], "permissions")

    assert change is not None
    assert change.after == ["manage_categories"]
    assert "manage_members" in change.before


async def test_renaming_the_project_is_recorded(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    connection = FakeConnection(ADMIN)

    await send(
        loaded,
        connection,
        groups.websocket_update_group,
        {"group_id": project["group"].id, "name": "Maison"},
    )

    entries = await journal(manager, project, RevisionEntity.GROUP)

    assert moved(entries[0], "name").before == "The Flat"
    assert moved(entries[0], "name").after == "Maison"


async def test_archiving_is_recorded(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    connection = FakeConnection(ADMIN)

    await send(
        loaded,
        connection,
        groups.websocket_archive_group,
        {"group_id": project["group"].id, "archived": True},
    )

    entries = await journal(manager, project, RevisionEntity.GROUP)

    assert moved(entries[0], "archived").after is True


async def test_a_save_that_changed_nothing_is_not_an_event(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """A journal full of nothing is a journal nobody reads."""

    connection = FakeConnection(ADMIN)

    await send(
        loaded,
        connection,
        groups.websocket_update_group,
        {"group_id": project["group"].id, "name": "The Flat"},
    )

    assert connection.errors == {}
    assert await journal(manager, project, RevisionEntity.GROUP) == []


#
# Categories
#


async def test_the_life_of_a_category_is_recorded(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    connection = FakeConnection(PLAIN)

    await send(
        loaded,
        connection,
        categories.websocket_create_category,
        {"group_id": project["group"].id, "name": "Courses"},
    )

    category = connection.results[1]

    await send(
        loaded,
        FakeConnection(PLAIN),
        categories.websocket_update_category,
        {"category_id": category["id"], "name": "Alimentation"},
    )

    await send(
        loaded,
        FakeConnection(ADMIN),
        categories.websocket_delete_category,
        {"category_id": category["id"]},
    )

    entries = await journal(manager, project, RevisionEntity.CATEGORY)

    assert [entry.action for entry in entries] == [
        RevisionAction.DELETED,
        RevisionAction.UPDATED,
        RevisionAction.CREATED,
    ]
    assert moved(entries[1], "name").after == "Alimentation"
    assert entries[1].actor_user_id == PLAIN
    assert entries[0].actor_user_id == ADMIN


#
# Who is in it
#


async def test_somebody_joining_is_recorded(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    connection = FakeConnection(ADMIN)

    await send(
        loaded,
        connection,
        members.websocket_create_member,
        {"group_id": project["group"].id, "name": "Clara"},
    )

    entries = await journal(manager, project, RevisionEntity.MEMBER)

    assert entries[0].action is RevisionAction.CREATED
    assert entries[0].entity_label == "Clara"
    assert entries[0].actor_user_id == ADMIN


async def test_somebody_leaving_is_recorded(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    connection = FakeConnection(PLAIN)

    await send(
        loaded,
        connection,
        members.websocket_remove_member_from_group,
        {"group_id": project["group"].id, "member_id": project["plain"].id},
    )

    assert connection.errors == {}

    entries = await journal(manager, project, RevisionEntity.MEMBER)

    assert entries[0].action is RevisionAction.DELETED
    assert entries[0].entity_label == "Antonin"


async def test_a_rename_is_recorded_in_the_project_that_asked(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """A member is global, so a rename is felt everywhere.

    The project whose journal shows it is the one where it was decided; the
    others were not party to it, and would be showing somebody else's business.
    """

    other = await manager.create_group(
        group_name="Ski",
        admin_name="Antonin",
        admin_user_id=PLAIN,
    )

    connection = FakeConnection(PLAIN)

    await send(
        loaded,
        connection,
        members.websocket_update_member,
        {
            "member_id": project["plain"].id,
            "group_id": project["group"].id,
            "name": "Antonin R.",
        },
    )

    assert connection.errors == {}

    here = await journal(manager, project, RevisionEntity.MEMBER)

    assert moved(here[0], "name").after == "Antonin R."

    elsewhere = [
        revision
        for revision in await manager.list_revisions(other.id)
        if revision.entity_type is RevisionEntity.MEMBER
    ]

    assert elsewhere == []


async def test_wearing_the_home_assistant_photo_is_recorded(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """A member choosing their Home Assistant photo is kept like the colour.

    Sent through the real command, so its schema has to know the field — an
    unknown key is refused outright. And read back through the journal, not just
    the row: the save writes unconditionally, so the flag would land whether or
    not the state knew it; only a missing journal line would betray that the
    change was never noticed. The line is the proof it was.
    """

    connection = FakeConnection(PLAIN)

    await send(
        loaded,
        connection,
        members.websocket_update_member,
        {
            "member_id": project["plain"].id,
            "group_id": project["group"].id,
            "use_ha_avatar": True,
        },
    )

    assert connection.errors == {}
    assert connection.results[1]["use_ha_avatar"] is True

    member = await manager.get_member(project["plain"].id)
    assert member.use_ha_avatar is True

    entry = (await journal(manager, project, RevisionEntity.MEMBER))[0]
    change = moved(entry, "use_ha_avatar")

    assert change is not None
    assert change.before is False
    assert change.after is True


async def test_handing_the_project_on_is_recorded_for_both(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """Two people changed standing, so two lines.

    The one giving it up is not a footnote to the one taking it: they lost every
    right they had, and their own history should say when.
    """

    connection = FakeConnection(ADMIN)

    await send(
        loaded,
        connection,
        groups.websocket_transfer_admin,
        {"group_id": project["group"].id, "member_id": project["plain"].id},
    )

    assert connection.errors == {}

    # Only the standings that moved. Everybody also has a line for joining,
    # which carries a role too — and is older, so a plain dict of the lot would
    # quietly answer with that one.
    entries = [
        entry
        for entry in await journal(manager, project, RevisionEntity.MEMBER)
        if entry.action is RevisionAction.UPDATED
    ]

    assert len(entries) == 2

    by_member = {entry.entity_id: moved(entry, "role") for entry in entries}

    assert by_member[project["plain"].id].before == "member"
    assert by_member[project["plain"].id].after == "admin"
    assert by_member[project["admin"].id].before == "admin"
    assert by_member[project["admin"].id].after == "member"


#
# The journal is the group's, and only the group's
#


async def test_the_journal_of_another_project_stays_out_of_reach(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """Everything above is now in a journal, so everything above can leak."""

    other = await manager.create_group(
        group_name="Ski",
        admin_name="Bruno",
        admin_user_id="ha-bruno",
    )

    await manager.update_group(
        replace(other, name="Chamonix"),
        actor_user_id="ha-bruno",
    )

    mine = await manager.list_revisions(project["group"].id)

    assert all(revision.group_id == project["group"].id for revision in mine)
    assert all(revision.entity_label != "Chamonix" for revision in mine)
