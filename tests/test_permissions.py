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

from dataclasses import replace
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
from tests.conftest import FakeConnection, FakeHass
from tests.test_websocket import call as _call

NOW = datetime(2026, 7, 14, 12, 0, tzinfo=UTC)

ADMIN = "ha-admin"
PLAIN = "ha-plain"


async def call(
    hass: FakeHass,
    connection: FakeConnection,
    handler: Any,
    payload: dict[str, Any],
) -> None:
    """Send a message, naming the command from the handler that answers it.

    Same door as everywhere else — the real schema, the real decorators — with
    the type derived rather than spelled out, so a payload can never be sent to
    a command it does not belong to.
    """

    command = handler.__name__.removeprefix("websocket_")

    await _call(
        hass,
        connection,
        handler,
        {"type": f"shared_expenses/{command}", **payload},
    )


@pytest.fixture
async def household(manager: SharedExpensesManager) -> dict[str, Any]:
    """Return a group with its admin, an ordinary member, and a guest.

    Everything is granted: that is what a group looks like out of the box, and
    what every one of these tests has to take away on purpose.

    Three people and two roles. There is no third: whoever makes the group runs
    it, everybody else is a member, and nobody is handed anything in between.
    """

    group = await manager.create_group(
        group_name="Montigny",
        admin_name="Stephane",
        admin_user_id=ADMIN,
    )

    admin = await manager.get_member_for_user(ADMIN)
    assert admin is not None

    plain = await manager.create_group_member(
        group_id=group.id,
        name="Antonin",
        user_id=PLAIN,
    )

    # No account: carries expenses, never logs in.
    guest = await manager.create_group_member(group_id=group.id, name="Marc")

    return {"group": group, "admin": admin, "plain": plain, "guest": guest}


async def close(
    manager: SharedExpensesManager,
    group_id: str,
    *keep: Permission,
) -> None:
    """Take every permission off a group but the ones named."""

    group = await manager.get_group(group_id)

    await manager.update_group(replace(group, permissions=frozenset(keep)))


#
# There is one admin, and it is never handed out
#


async def test_a_new_group_is_run_by_whoever_made_it(
    manager: SharedExpensesManager,
    household: dict[str, Any],
):
    """One admin, and exactly one."""

    memberships = await manager.list_group_memberships(household["group"].id)

    admins = [m for m in memberships if m.role is GroupRole.ADMIN]

    assert [m.member_id for m in admins] == [household["admin"].id]


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
    household: dict[str, Any],
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
        **payload_of(household),
    }

    handler._ws_schema(dict(payload))

    with pytest.raises(vol.Invalid, match="role"):
        handler._ws_schema({**payload, "role": "admin"})


async def test_somebody_added_is_a_member(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    household: dict[str, Any],
):
    """And the group still has exactly one admin afterwards."""

    connection = FakeConnection(PLAIN)

    await call(
        loaded,
        connection,
        members.websocket_create_member,
        {
            "group_id": household["group"].id,
            "name": "Clara",
            "user_id": "ha-clara",
        },
    )

    assert connection.errors == {}

    memberships = await manager.list_group_memberships(household["group"].id)
    admins = [m for m in memberships if m.role is GroupRole.ADMIN]

    assert len(admins) == 1
    assert admins[0].member_id == household["admin"].id


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
    household: dict[str, Any],
    permission: Permission,
    handler_of: Any,
    payload_of: Any,
):
    """The whole point: a switch that is off stops somebody doing the thing."""

    await close(manager, household["group"].id)

    connection = FakeConnection(PLAIN)

    await call(loaded, connection, handler_of(), payload_of(household))

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
    household: dict[str, Any],
    permission: Permission,
    handler_of: Any,
    payload_of: Any,
):
    """The other half, and the one that catches a wall built too high.

    A refusal that cannot be lifted is not a permission, it is a bug wearing
    one's clothes.
    """

    await close(manager, household["group"].id, permission)

    connection = FakeConnection(PLAIN)

    await call(loaded, connection, handler_of(), payload_of(household))

    assert connection.errors == {}, f"{permission} was on and it was refused anyway"
    assert 1 in connection.results


async def test_the_admin_is_above_every_switch(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    household: dict[str, Any],
):
    """What makes one switch per group enough, instead of a matrix per person."""

    await close(manager, household["group"].id)

    connection = FakeConnection(ADMIN)

    await call(
        loaded,
        connection,
        categories.websocket_create_category,
        {"group_id": household["group"].id, "name": "Courses"},
    )

    assert connection.errors == {}
    assert 1 in connection.results


#
# Whose entry is whose
#


async def test_you_may_always_edit_what_you_entered(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    household: dict[str, Any],
):
    """Recording what somebody else paid must not cost you your own typo."""

    await close(manager, household["group"].id)

    expense = await manager.create_expense(
        group_id=household["group"].id,
        title="Courses",
        amount=5000,
        # Somebody else paid...
        paid_by_member_id=household["admin"].id,
        expense_date=NOW,
        # ...and the ordinary member is the one who typed it in.
        actor_user_id=PLAIN,
    )

    assert expense.created_by_member_id == household["plain"].id

    connection = FakeConnection(PLAIN)

    await call(
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
    household: dict[str, Any],
):
    """The other half of "yours": the money was yours even if the typing was not."""

    await close(manager, household["group"].id)

    expense = await manager.create_expense(
        group_id=household["group"].id,
        title="Essence",
        amount=5000,
        paid_by_member_id=household["plain"].id,
        expense_date=NOW,
        actor_user_id=ADMIN,
    )

    connection = FakeConnection(PLAIN)

    await call(
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
    household: dict[str, Any],
):
    """Neither paid nor typed: not yours, and the group has to say so."""

    await close(manager, household["group"].id)

    expense = await manager.create_expense(
        group_id=household["group"].id,
        title="Restaurant",
        amount=5000,
        paid_by_member_id=household["admin"].id,
        expense_date=NOW,
        actor_user_id=ADMIN,
    )

    connection = FakeConnection(PLAIN)

    await call(
        loaded,
        connection,
        expenses.websocket_update_expense,
        {"expense_id": expense.id, "title": "Vole"},
    )

    assert connection.errors[1][0] == "not_allowed"

    # And the same message goes straight through once the group allows it.
    await close(manager, household["group"].id, Permission.EDIT_OTHERS)

    allowed = FakeConnection(PLAIN)

    await call(
        loaded,
        allowed,
        expenses.websocket_update_expense,
        {"expense_id": expense.id, "title": "Restaurant du coin"},
    )

    assert allowed.errors == {}


async def test_deleting_somebody_elses_expense_needs_the_permission(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    household: dict[str, Any],
):
    """Deleting is editing, and it is the one that cannot be undone."""

    await close(manager, household["group"].id)

    expense = await manager.create_expense(
        group_id=household["group"].id,
        title="Restaurant",
        amount=5000,
        paid_by_member_id=household["admin"].id,
        expense_date=NOW,
        actor_user_id=ADMIN,
    )

    connection = FakeConnection(PLAIN)

    await call(
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
    household: dict[str, Any],
):
    """A debt you owe is as much yours to correct as the lender's."""

    await close(manager, household["group"].id)

    payment = await manager.create_payment(
        group_id=household["group"].id,
        from_member_id=household["admin"].id,
        to_member_id=household["plain"].id,
        amount=1000,
        payment_date=NOW,
        actor_user_id=ADMIN,
    )

    connection = FakeConnection(PLAIN)

    await call(
        loaded,
        connection,
        payments.websocket_update_payment,
        {"payment_id": payment.id, "description": "Le pret de juin"},
    )

    assert connection.errors == {}


async def test_a_payment_between_two_others_is_not_yours(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    household: dict[str, Any],
):
    """Neither party, nor the one who wrote it down."""

    await close(manager, household["group"].id)

    payment = await manager.create_payment(
        group_id=household["group"].id,
        from_member_id=household["admin"].id,
        to_member_id=household["guest"].id,
        amount=1000,
        payment_date=NOW,
        actor_user_id=ADMIN,
    )

    connection = FakeConnection(PLAIN)

    await call(
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
    household: dict[str, Any],
):
    """Even where the group lets its members manage it.

    A member who could open the switches could open all of them, and the group
    would allow whatever the last person to ask decided.
    """

    connection = FakeConnection(PLAIN)

    await call(
        loaded,
        connection,
        groups.websocket_update_group,
        {
            "group_id": household["group"].id,
            "permissions": [str(Permission.MANAGE_MEMBERS)],
        },
    )

    assert connection.errors[1][0] == "not_allowed"


async def test_the_admin_changes_the_permissions(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    household: dict[str, Any],
):
    """And what is sent is the whole set, so a switch can actually go off."""

    connection = FakeConnection(ADMIN)

    await call(
        loaded,
        connection,
        groups.websocket_update_group,
        {
            "group_id": household["group"].id,
            "permissions": [str(Permission.MANAGE_CATEGORIES)],
        },
    )

    assert connection.errors == {}

    group = await manager.get_group(household["group"].id)

    assert group.permissions == {Permission.MANAGE_CATEGORIES}


async def test_only_the_admin_deletes_the_group(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    household: dict[str, Any],
):
    """It takes every expense with it. Until recently, any member could."""

    connection = FakeConnection(PLAIN)

    await call(
        loaded,
        connection,
        groups.websocket_delete_group,
        {"group_id": household["group"].id},
    )

    assert connection.errors[1][0] == "not_allowed"
    assert await manager.get_group(household["group"].id) is not None


#
# Handing the group on
#


async def test_the_admin_hands_the_group_over(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    household: dict[str, Any],
):
    """The new admin runs it, and the old one becomes an ordinary member.

    Nowhere else for them to land: a group has one admin, so handing it on is
    giving it up, not sharing it.
    """

    connection = FakeConnection(ADMIN)

    await call(
        loaded,
        connection,
        groups.websocket_transfer_admin,
        {"group_id": household["group"].id, "member_id": household["plain"].id},
    )

    assert connection.errors == {}

    assert await manager.group_role(household["group"].id, PLAIN) is GroupRole.ADMIN
    assert await manager.group_role(household["group"].id, ADMIN) is GroupRole.MEMBER


async def test_the_group_has_one_admin_after_a_transfer(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    household: dict[str, Any],
):
    """Counted rather than assumed: two admins is the failure worth catching."""

    connection = FakeConnection(ADMIN)

    await call(
        loaded,
        connection,
        groups.websocket_transfer_admin,
        {"group_id": household["group"].id, "member_id": household["plain"].id},
    )

    memberships = await manager.list_group_memberships(household["group"].id)

    admins = [m for m in memberships if m.role is GroupRole.ADMIN and m.left_at is None]

    assert len(admins) == 1
    assert admins[0].member_id == household["plain"].id


async def test_handing_it_on_costs_the_old_admin_their_standing(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    household: dict[str, Any],
):
    """Not a courtesy title: they are a member, and the switches now bind them."""

    handing_over = FakeConnection(ADMIN)

    await call(
        loaded,
        handing_over,
        groups.websocket_transfer_admin,
        {"group_id": household["group"].id, "member_id": household["plain"].id},
    )

    await close(manager, household["group"].id)

    connection = FakeConnection(ADMIN)

    await call(
        loaded,
        connection,
        categories.websocket_create_category,
        {"group_id": household["group"].id, "name": "Courses"},
    )

    assert connection.errors[1][0] == "not_allowed"


async def test_the_old_admin_can_finally_leave(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    household: dict[str, Any],
):
    """The whole reason handing on had to exist.

    The admin cannot leave their own group — that is right, since access comes
    from membership and a group whose admin walked out is a group nobody can
    run. Without a way to hand it on, it meant being in it for life.
    """

    handing_over = FakeConnection(ADMIN)

    await call(
        loaded,
        handing_over,
        groups.websocket_transfer_admin,
        {"group_id": household["group"].id, "member_id": household["plain"].id},
    )

    leaving = FakeConnection(ADMIN)

    await call(
        loaded,
        leaving,
        members.websocket_remove_member_from_group,
        {"group_id": household["group"].id, "member_id": household["admin"].id},
    )

    assert leaving.errors == {}
    assert await manager.group_role(household["group"].id, ADMIN) is None


async def test_the_admin_cannot_leave_without_handing_it_on(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    household: dict[str, Any],
):
    """The other side of the same rule."""

    connection = FakeConnection(ADMIN)

    await call(
        loaded,
        connection,
        members.websocket_remove_member_from_group,
        {"group_id": household["group"].id, "member_id": household["admin"].id},
    )

    assert connection.errors[1][0] == "cannot_remove_admin"
    assert await manager.group_role(household["group"].id, ADMIN) is GroupRole.ADMIN


async def test_nobody_but_the_admin_hands_the_group_on(
    loaded: FakeHass,
    household: dict[str, Any],
):
    connection = FakeConnection(PLAIN)

    await call(
        loaded,
        connection,
        groups.websocket_transfer_admin,
        {"group_id": household["group"].id, "member_id": household["plain"].id},
    )

    assert connection.errors[1][0] == "not_allowed"


async def test_the_group_is_never_handed_to_somebody_who_cannot_log_in(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    household: dict[str, Any],
):
    """A member without an account carries expenses but never opens the panel.

    Made admin, they would hold every right nobody can exercise, and the group
    could never be handed on again — there would be nobody able to do it.
    """

    connection = FakeConnection(ADMIN)

    await call(
        loaded,
        connection,
        groups.websocket_transfer_admin,
        {"group_id": household["group"].id, "member_id": household["guest"].id},
    )

    assert connection.errors[1][0] == "admin_needs_account"
    assert await manager.group_role(household["group"].id, ADMIN) is GroupRole.ADMIN


#
# Yourself
#


async def test_you_may_always_rename_yourself(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    household: dict[str, Any],
):
    """A name is your own, whatever the group says about managing members."""

    await close(manager, household["group"].id)

    connection = FakeConnection(PLAIN)

    await call(
        loaded,
        connection,
        members.websocket_update_member,
        {
            "member_id": household["plain"].id,
            "group_id": household["group"].id,
            "name": "Antonin R.",
        },
    )

    assert connection.errors == {}


async def test_renaming_somebody_else_needs_the_permission(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    household: dict[str, Any],
):
    await close(manager, household["group"].id)

    connection = FakeConnection(PLAIN)

    await call(
        loaded,
        connection,
        members.websocket_update_member,
        {
            "member_id": household["guest"].id,
            "group_id": household["group"].id,
            "name": "Vole",
        },
    )

    assert connection.errors[1][0] == "not_allowed"


async def test_you_may_always_leave(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    household: dict[str, Any],
):
    """Being unable to leave is the trap the admin is in until they hand on."""

    await close(manager, household["group"].id)

    connection = FakeConnection(PLAIN)

    await call(
        loaded,
        connection,
        members.websocket_remove_member_from_group,
        {"group_id": household["group"].id, "member_id": household["plain"].id},
    )

    assert connection.errors == {}
    assert await manager.group_role(household["group"].id, PLAIN) is None


async def test_removing_somebody_else_needs_the_permission(
    loaded: FakeHass,
    manager: SharedExpensesManager,
    household: dict[str, Any],
):
    await close(manager, household["group"].id)

    connection = FakeConnection(PLAIN)

    await call(
        loaded,
        connection,
        members.websocket_remove_member_from_group,
        {"group_id": household["group"].id, "member_id": household["guest"].id},
    )

    assert connection.errors[1][0] == "not_allowed"


#
# What a refusal is allowed to say
#


async def test_a_stranger_is_told_the_group_does_not_exist(
    loaded: FakeHass,
    household: dict[str, Any],
):
    """Never "not allowed": that would confirm the group is there.

    The two refusals answer two different questions, and only this one is
    nobody's business. A permission refusal says what it is, because by then
    the caller is already looking straight at the thing.
    """

    connection = FakeConnection("ha-stranger")

    await call(
        loaded,
        connection,
        groups.websocket_delete_group,
        {"group_id": household["group"].id},
    )

    assert connection.errors[1][0] == "group_not_found"
