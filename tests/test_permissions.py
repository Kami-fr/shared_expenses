"""Tests for what a group lets its members do, and for who runs it.

Driven through the *real* schemas and the *real* decorators, like the rest of
the WebSocket tests: a permission enforced by a manager method nobody calls is
not enforced at all, and only going in through the front door proves otherwise.

The point here is the refusals. Every group grants everything by default, so a
suite that only ever exercises the happy path walks straight through this code
without ever waking it — which is exactly what the tests that came before this
file did.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

import pytest
import voluptuous as vol

from custom_components.shared_expenses.manager import SharedExpensesManager
from custom_components.shared_expenses.models import GroupRole, Permission
from custom_components.shared_expenses.websocket import (
    categories,
    expenses,
    groups,
    members,
    payments,
)
from tests.conftest import ADMIN, PLAIN, FakeConnection, FakeHass, close_project, send

NOW = datetime(2026, 7, 14, 12, 0, tzinfo=UTC)


#
# There is one admin, and it is never handed out
#


async def test_a_new_group_is_run_by_whoever_made_it(
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """One admin, and exactly one."""

    memberships = await manager.list_group_memberships(project["group"].id)

    admins = [m for m in memberships if m.role is GroupRole.ADMIN]

    assert [m.member_id for m in admins] == [project["admin"].id]


@pytest.mark.parametrize(
    ("handler_of", "payload_of"),
    [
        (
            lambda: members.websocket_create_member,
            lambda h: {
                "group_id": h["group"].id,
                "name": "Complice",
                "user_id": "ha-second-account",
            },
        ),
        (
            lambda: members.websocket_add_member_to_group,
            lambda h: {"group_id": h["group"].id, "member_id": h["guest"].id},
        ),
    ],
)
async def test_no_door_takes_a_role_on_the_way_in(
    project: dict[str, Any],
    handler_of: Any,
    payload_of: Any,
):
    """The floor the whole arrangement stands on.

    Managing members is granted here — the default — and it must still not be a
    way to bring in an account of your own as a second admin. There is no role
    to send: the schema does not know the word.

    Asserted on the schema itself rather than on an answer, because that is
    where it is settled. The message never reaches a handler, so there is no
    handler left to get this wrong.
    """

    handler = handler_of()
    command = handler.__name__.removeprefix("websocket_")

    # A message the schema is happy with, so that what it objects to below can
    # only be the role.
    payload = {
        "id": 1,
        "type": f"shared_expenses/{command}",
        **payload_of(project),
    }

    handler._ws_schema(dict(payload))

    with pytest.raises(vol.Invalid, match="role"):
        handler._ws_schema({**payload, "role": "admin"})


async def test_somebody_added_is_a_member(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """And the group still has exactly one admin afterwards."""

    connection = FakeConnection(PLAIN)

    await send(
        loaded,
        connection,
        members.websocket_create_member,
        {
            "group_id": project["group"].id,
            "name": "Clara",
            "user_id": "ha-clara",
        },
    )

    assert connection.errors == {}

    memberships = await manager.list_group_memberships(project["group"].id)
    admins = [m for m in memberships if m.role is GroupRole.ADMIN]

    assert len(admins) == 1
    assert admins[0].member_id == project["admin"].id


#
# What the switches actually do
#


@pytest.mark.parametrize(
    ("permission", "handler_of", "payload_of"),
    [
        (
            Permission.MANAGE_CATEGORIES,
            lambda: categories.websocket_create_category,
            lambda h: {"group_id": h["group"].id, "name": "Courses"},
        ),
        (
            Permission.MANAGE_MEMBERS,
            lambda: members.websocket_create_member,
            lambda h: {"group_id": h["group"].id, "name": "Nouveau"},
        ),
        (
            Permission.MANAGE_GROUP,
            lambda: groups.websocket_update_group,
            lambda h: {"group_id": h["group"].id, "name": "Renomme"},
        ),
        (
            Permission.MANAGE_GROUP,
            lambda: groups.websocket_archive_group,
            lambda h: {"group_id": h["group"].id, "archived": True},
        ),
    ],
)
async def test_a_closed_switch_refuses_an_ordinary_member(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
    permission: Permission,
    handler_of: Any,
    payload_of: Any,
):
    """The whole point: a switch that is off stops somebody doing the thing."""

    await close_project(manager, project["group"].id)

    connection = FakeConnection(PLAIN)

    await send(loaded, connection, handler_of(), payload_of(project))

    assert connection.errors[1][0] == "not_allowed", (
        f"{permission} was off and the command went through anyway"
    )
    assert connection.results == {}


@pytest.mark.parametrize(
    ("permission", "handler_of", "payload_of"),
    [
        (
            Permission.MANAGE_CATEGORIES,
            lambda: categories.websocket_create_category,
            lambda h: {"group_id": h["group"].id, "name": "Courses"},
        ),
        (
            Permission.MANAGE_MEMBERS,
            lambda: members.websocket_create_member,
            lambda h: {"group_id": h["group"].id, "name": "Nouveau"},
        ),
        (
            Permission.MANAGE_GROUP,
            lambda: groups.websocket_update_group,
            lambda h: {"group_id": h["group"].id, "name": "Renomme"},
        ),
    ],
)
async def test_an_open_switch_lets_an_ordinary_member_through(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
    permission: Permission,
    handler_of: Any,
    payload_of: Any,
):
    """The other half, and the one that catches a wall built too high.

    A refusal that cannot be lifted is not a permission, it is a bug wearing
    one's clothes.
    """

    await close_project(manager, project["group"].id, permission)

    connection = FakeConnection(PLAIN)

    await send(loaded, connection, handler_of(), payload_of(project))

    assert connection.errors == {}, f"{permission} was on and it was refused anyway"
    assert 1 in connection.results


async def test_the_admin_is_above_every_switch(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """What makes one switch per group enough, instead of a matrix per person."""

    await close_project(manager, project["group"].id)

    connection = FakeConnection(ADMIN)

    await send(
        loaded,
        connection,
        categories.websocket_create_category,
        {"group_id": project["group"].id, "name": "Courses"},
    )

    assert connection.errors == {}
    assert 1 in connection.results


#
# Whose entry is whose
#


async def test_you_may_always_edit_what_you_entered(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """Recording what somebody else paid must not cost you your own typo."""

    await close_project(manager, project["group"].id)

    expense = await manager.create_expense(
        group_id=project["group"].id,
        title="Courses",
        amount=5000,
        # Somebody else paid...
        paid_by_member_id=project["admin"].id,
        expense_date=NOW,
        # ...and the ordinary member is the one who typed it in.
        actor_user_id=PLAIN,
    )

    assert expense.created_by_member_id == project["plain"].id

    connection = FakeConnection(PLAIN)

    await send(
        loaded,
        connection,
        expenses.websocket_update_expense,
        {"expense_id": expense.id, "title": "Courses Carrefour"},
    )

    assert connection.errors == {}
    assert 1 in connection.results


async def test_you_may_always_edit_what_you_paid(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """The other half of "yours": the money was yours even if the typing was not."""

    await close_project(manager, project["group"].id)

    expense = await manager.create_expense(
        group_id=project["group"].id,
        title="Essence",
        amount=5000,
        paid_by_member_id=project["plain"].id,
        expense_date=NOW,
        actor_user_id=ADMIN,
    )

    connection = FakeConnection(PLAIN)

    await send(
        loaded,
        connection,
        expenses.websocket_update_expense,
        {"expense_id": expense.id, "title": "Essence Total"},
    )

    assert connection.errors == {}
    assert 1 in connection.results


async def test_somebody_elses_expense_needs_the_permission(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """Neither paid nor typed: not yours, and the group has to say so."""

    await close_project(manager, project["group"].id)

    expense = await manager.create_expense(
        group_id=project["group"].id,
        title="Restaurant",
        amount=5000,
        paid_by_member_id=project["admin"].id,
        expense_date=NOW,
        actor_user_id=ADMIN,
    )

    connection = FakeConnection(PLAIN)

    await send(
        loaded,
        connection,
        expenses.websocket_update_expense,
        {"expense_id": expense.id, "title": "Vole"},
    )

    assert connection.errors[1][0] == "not_allowed"

    # And the same message goes straight through once the group allows it.
    await close_project(manager, project["group"].id, Permission.EDIT_OTHERS)

    allowed = FakeConnection(PLAIN)

    await send(
        loaded,
        allowed,
        expenses.websocket_update_expense,
        {"expense_id": expense.id, "title": "Restaurant du coin"},
    )

    assert allowed.errors == {}


async def test_deleting_somebody_elses_expense_needs_the_permission(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """Deleting is editing, and it is the one that cannot be undone."""

    await close_project(manager, project["group"].id)

    expense = await manager.create_expense(
        group_id=project["group"].id,
        title="Restaurant",
        amount=5000,
        paid_by_member_id=project["admin"].id,
        expense_date=NOW,
        actor_user_id=ADMIN,
    )

    connection = FakeConnection(PLAIN)

    await send(
        loaded,
        connection,
        expenses.websocket_delete_expense,
        {"expense_id": expense.id},
    )

    assert connection.errors[1][0] == "not_allowed"
    assert await manager.get_expense(expense.id) is not None


async def test_a_payment_is_yours_when_it_is_about_you(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """A debt you owe is as much yours to correct as the lender's."""

    await close_project(manager, project["group"].id)

    payment = await manager.create_payment(
        group_id=project["group"].id,
        from_member_id=project["admin"].id,
        to_member_id=project["plain"].id,
        amount=1000,
        payment_date=NOW,
        actor_user_id=ADMIN,
    )

    connection = FakeConnection(PLAIN)

    await send(
        loaded,
        connection,
        payments.websocket_update_payment,
        {"payment_id": payment.id, "description": "Le pret de juin"},
    )

    assert connection.errors == {}


async def test_a_payment_between_two_others_is_not_yours(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """Neither party, nor the one who wrote it down."""

    await close_project(manager, project["group"].id)

    payment = await manager.create_payment(
        group_id=project["group"].id,
        from_member_id=project["admin"].id,
        to_member_id=project["guest"].id,
        amount=1000,
        payment_date=NOW,
        actor_user_id=ADMIN,
    )

    connection = FakeConnection(PLAIN)

    await send(
        loaded,
        connection,
        payments.websocket_update_payment,
        {"payment_id": payment.id, "description": "Vole"},
    )

    assert connection.errors[1][0] == "not_allowed"


#
# The admin's own
#


async def test_only_the_admin_may_change_the_permissions(
    loaded: FakeHass,
    project: dict[str, Any],
):
    """Even where the group lets its members manage it.

    A member who could open the switches could open all of them, and the group
    would allow whatever the last person to ask decided.
    """

    connection = FakeConnection(PLAIN)

    await send(
        loaded,
        connection,
        groups.websocket_update_group,
        {
            "group_id": project["group"].id,
            "permissions": [str(Permission.MANAGE_MEMBERS)],
        },
    )

    assert connection.errors[1][0] == "not_allowed"


async def test_the_admin_changes_the_permissions(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """And what is sent is the whole set, so a switch can actually go off."""

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

    group = await manager.get_group(project["group"].id)

    assert group.permissions == {Permission.MANAGE_CATEGORIES}


async def test_only_the_admin_deletes_the_group(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """It takes every expense with it. Until recently, any member could."""

    connection = FakeConnection(PLAIN)

    await send(
        loaded,
        connection,
        groups.websocket_delete_group,
        {"group_id": project["group"].id},
    )

    assert connection.errors[1][0] == "not_allowed"
    assert await manager.get_group(project["group"].id) is not None


#
# Handing the group on
#


async def test_the_admin_hands_the_group_over(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """The new admin runs it, and the old one becomes an ordinary member.

    Nowhere else for them to land: a group has one admin, so handing it on is
    giving it up, not sharing it.
    """

    connection = FakeConnection(ADMIN)

    await send(
        loaded,
        connection,
        groups.websocket_transfer_admin,
        {"group_id": project["group"].id, "member_id": project["plain"].id},
    )

    assert connection.errors == {}

    assert await manager.group_role(project["group"].id, PLAIN) is GroupRole.ADMIN
    assert await manager.group_role(project["group"].id, ADMIN) is GroupRole.MEMBER


async def test_the_group_has_one_admin_after_a_transfer(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """Counted rather than assumed: two admins is the failure worth catching."""

    connection = FakeConnection(ADMIN)

    await send(
        loaded,
        connection,
        groups.websocket_transfer_admin,
        {"group_id": project["group"].id, "member_id": project["plain"].id},
    )

    memberships = await manager.list_group_memberships(project["group"].id)

    admins = [m for m in memberships if m.role is GroupRole.ADMIN and m.left_at is None]

    assert len(admins) == 1
    assert admins[0].member_id == project["plain"].id


async def test_handing_it_on_costs_the_old_admin_their_standing(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """Not a courtesy title: they are a member, and the switches now bind them."""

    handing_over = FakeConnection(ADMIN)

    await send(
        loaded,
        handing_over,
        groups.websocket_transfer_admin,
        {"group_id": project["group"].id, "member_id": project["plain"].id},
    )

    await close_project(manager, project["group"].id)

    connection = FakeConnection(ADMIN)

    await send(
        loaded,
        connection,
        categories.websocket_create_category,
        {"group_id": project["group"].id, "name": "Courses"},
    )

    assert connection.errors[1][0] == "not_allowed"


async def test_the_old_admin_can_finally_leave(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """The whole reason handing on had to exist.

    The admin cannot leave their own group — that is right, since access comes
    from membership and a group whose admin walked out is a group nobody can
    run. Without a way to hand it on, it meant being in it for life.
    """

    handing_over = FakeConnection(ADMIN)

    await send(
        loaded,
        handing_over,
        groups.websocket_transfer_admin,
        {"group_id": project["group"].id, "member_id": project["plain"].id},
    )

    leaving = FakeConnection(ADMIN)

    await send(
        loaded,
        leaving,
        members.websocket_remove_member_from_group,
        {"group_id": project["group"].id, "member_id": project["admin"].id},
    )

    assert leaving.errors == {}
    assert await manager.group_role(project["group"].id, ADMIN) is None


async def test_the_admin_cannot_leave_without_handing_it_on(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """The other side of the same rule."""

    connection = FakeConnection(ADMIN)

    await send(
        loaded,
        connection,
        members.websocket_remove_member_from_group,
        {"group_id": project["group"].id, "member_id": project["admin"].id},
    )

    assert connection.errors[1][0] == "cannot_remove_admin"
    assert await manager.group_role(project["group"].id, ADMIN) is GroupRole.ADMIN


async def test_nobody_but_the_admin_hands_the_group_on(
    loaded: FakeHass,
    project: dict[str, Any],
):
    connection = FakeConnection(PLAIN)

    await send(
        loaded,
        connection,
        groups.websocket_transfer_admin,
        {"group_id": project["group"].id, "member_id": project["plain"].id},
    )

    assert connection.errors[1][0] == "not_allowed"


async def test_the_group_is_never_handed_to_somebody_who_cannot_log_in(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """A member without an account carries expenses but never opens the panel.

    Made admin, they would hold every right nobody can exercise, and the group
    could never be handed on again — there would be nobody able to do it.
    """

    connection = FakeConnection(ADMIN)

    await send(
        loaded,
        connection,
        groups.websocket_transfer_admin,
        {"group_id": project["group"].id, "member_id": project["guest"].id},
    )

    assert connection.errors[1][0] == "admin_needs_account"
    assert await manager.group_role(project["group"].id, ADMIN) is GroupRole.ADMIN


#
# Yourself
#


async def test_you_may_always_rename_yourself(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """A name is your own, whatever the group says about managing members."""

    await close_project(manager, project["group"].id)

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


async def test_renaming_yourself_still_needs_the_group_asking_to_be_yours(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """The self shortcut is not a way round the wall.

    `group_id` is the journal the rename lands in and the group told about it.
    Sharing *a* group with somebody is what gets the caller this far; being in
    *this* one is what lets them write into it — so a project they used to
    belong to, whose id they still know, must refuse them like any stranger.
    """

    other = await manager.create_group(
        group_name="Ski",
        admin_name="Marc",
        admin_user_id="ha-stranger",
    )

    connection = FakeConnection(PLAIN)

    await send(
        loaded,
        connection,
        members.websocket_update_member,
        {
            "member_id": project["plain"].id,
            "group_id": other.id,
            "name": "Antonin R.",
        },
    )

    assert connection.errors[1][0] == "group_not_found"

    # Nothing written into a household the caller is not part of.
    assert [
        revision
        for revision in await manager.list_revisions(other.id)
        if revision.entity_label == "Antonin R."
    ] == []


async def test_renaming_somebody_else_needs_the_permission(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    await close_project(manager, project["group"].id)

    connection = FakeConnection(PLAIN)

    await send(
        loaded,
        connection,
        members.websocket_update_member,
        {
            "member_id": project["guest"].id,
            "group_id": project["group"].id,
            "name": "Vole",
        },
    )

    assert connection.errors[1][0] == "not_allowed"


async def test_renaming_somebody_else_is_not_a_group_you_bring_along(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """The group asking has to be the one that holds them.

    Otherwise the guard falls in half: sharing *a* group with somebody is what
    gets the caller this far, and a group of their own — where they are the
    admin, above every switch — would answer for a member it has never held. A
    member is global, so the rename would land everywhere, and the journal of
    the household whose leave was needed would show nothing.
    """

    await close_project(manager, project["group"].id)

    mine = await manager.create_group(
        group_name="Solo",
        admin_name="Antonin",
        admin_user_id=PLAIN,
    )

    connection = FakeConnection(PLAIN)

    await send(
        loaded,
        connection,
        members.websocket_update_member,
        {
            "member_id": project["guest"].id,
            "group_id": mine.id,
            "name": "Vole",
        },
    )

    assert connection.errors[1][0] == "member_not_found"

    guest = await manager.get_member(project["guest"].id)
    assert guest.name == "Marc"


async def test_you_may_always_leave(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """Being unable to leave is the trap the admin is in until they hand on."""

    await close_project(manager, project["group"].id)

    connection = FakeConnection(PLAIN)

    await send(
        loaded,
        connection,
        members.websocket_remove_member_from_group,
        {"group_id": project["group"].id, "member_id": project["plain"].id},
    )

    assert connection.errors == {}
    assert await manager.group_role(project["group"].id, PLAIN) is None


async def test_removing_somebody_else_needs_the_permission(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    await close_project(manager, project["group"].id)

    connection = FakeConnection(PLAIN)

    await send(
        loaded,
        connection,
        members.websocket_remove_member_from_group,
        {"group_id": project["group"].id, "member_id": project["guest"].id},
    )

    assert connection.errors[1][0] == "not_allowed"


#
# What a refusal is allowed to say
#


async def test_a_stranger_is_told_the_group_does_not_exist(
    loaded: FakeHass,
    project: dict[str, Any],
):
    """Never "not allowed": that would confirm the group is there.

    The two refusals answer two different questions, and only this one is
    nobody's business. A permission refusal says what it is, because by then
    the caller is already looking straight at the thing.
    """

    connection = FakeConnection("ha-stranger")

    await send(
        loaded,
        connection,
        groups.websocket_delete_group,
        {"group_id": project["group"].id},
    )

    assert connection.errors[1][0] == "group_not_found"
