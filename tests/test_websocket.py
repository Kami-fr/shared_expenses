"""Tests for the WebSocket API, and above all for its wall.

Every command is driven through the *real* voluptuous schema and the *real*
decorators, so a schema that refuses a legitimate message, or an authorisation
that lets someone through, fails here rather than on a Raspberry Pi.

What is not covered is the transport: Home Assistant's own socket, which is
Home Assistant's to test. Everything this integration wrote is.

The wall is the point. A group is private to its members, and a bug in it does
not crash anything — it quietly shows someone the expenses of a household they
have nothing to do with.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

import pytest

from custom_components.shared_expenses.manager import SharedExpensesManager
from custom_components.shared_expenses.websocket import (
    COMMANDS,
    categories,
    expenses,
    groups,
    members,
    payments,
    revisions,
    statistics,
)
from tests.conftest import FakeConnection, FakeHass

NOW = datetime(2026, 7, 14, 12, 0, tzinfo=UTC)

MINE = "ha-mine"
THEIRS = "ha-theirs"


async def call(
    hass: FakeHass,
    connection: FakeConnection,
    handler: Any,
    payload: dict[str, Any],
    msg_id: int = 1,
) -> None:
    """Send a message through the command's own schema and decorators."""

    msg = handler._ws_schema({"id": msg_id, **payload})

    handler(hass, connection, msg)

    await hass.settle()


@pytest.fixture
async def household(manager: SharedExpensesManager) -> dict[str, Any]:
    """Two groups of two different people, with an expense each.

    The whole shape the wall exists for: nothing of `theirs` may ever reach the
    account behind `mine`.
    """

    mine = await manager.create_group(
        group_name="Appartement",
        owner_name="Stephane",
        owner_user_id=MINE,
    )
    theirs = await manager.create_group(
        group_name="Ski",
        owner_name="Bruno",
        owner_user_id=THEIRS,
    )

    my_owner = (await manager.list_group_members(mine.id))[0]
    their_owner = (await manager.list_group_members(theirs.id))[0]

    their_category = await manager.create_category(
        group_id=theirs.id,
        name="Forfaits",
    )

    my_expense = await manager.create_expense(
        group_id=mine.id,
        title="Courses",
        amount=8542,
        paid_by_member_id=my_owner.id,
        expense_date=NOW,
    )
    their_expense = await manager.create_expense(
        group_id=theirs.id,
        title="Forfait",
        amount=40000,
        paid_by_member_id=their_owner.id,
        expense_date=NOW,
        category_id=their_category.id,
    )

    their_guest = await manager.create_group_member(
        group_id=theirs.id,
        name="Chloe",
    )

    their_payment = await manager.create_payment(
        group_id=theirs.id,
        from_member_id=their_guest.id,
        to_member_id=their_owner.id,
        amount=1000,
        payment_date=NOW,
    )

    return {
        "mine": mine,
        "theirs": theirs,
        "my_owner": my_owner,
        "their_owner": their_owner,
        "their_expense": their_expense,
        "their_category": their_category,
        "their_payment": their_payment,
        "their_guest": their_guest,
        "my_expense": my_expense,
    }


#
# The wall
#


async def test_a_group_you_do_not_belong_to_does_not_exist(
    loaded: FakeHass,
    household: dict[str, Any],
):
    """Refused as "not found", never as "not yours": that would leak it."""

    connection = FakeConnection(MINE)

    await call(
        loaded,
        connection,
        groups.websocket_get_group,
        {"type": "shared_expenses/get_group", "group_id": household["theirs"].id},
    )

    assert connection.errors[1][0] == "group_not_found"
    assert connection.results == {}


async def test_listing_groups_shows_only_your_own(
    loaded: FakeHass,
    household: dict[str, Any],
):
    connection = FakeConnection(MINE)

    await call(
        loaded,
        connection,
        groups.websocket_list_groups,
        {"type": "shared_expenses/list_groups"},
    )

    assert [group["name"] for group in connection.results[1]] == ["Appartement"]


@pytest.mark.parametrize(
    ("name", "handler_of", "payload_of", "code"),
    [
        (
            "get_expense",
            lambda: expenses.websocket_get_expense,
            lambda h: {"expense_id": h["their_expense"].id},
            "expense_not_found",
        ),
        (
            "delete_expense",
            lambda: expenses.websocket_delete_expense,
            lambda h: {"expense_id": h["their_expense"].id},
            "expense_not_found",
        ),
        (
            "delete_category",
            lambda: categories.websocket_delete_category,
            lambda h: {"category_id": h["their_category"].id},
            "category_not_found",
        ),
        (
            "delete_payment",
            lambda: payments.websocket_delete_payment,
            lambda h: {"payment_id": h["their_payment"].id},
            "payment_not_found",
        ),
        (
            "update_member",
            lambda: members.websocket_update_member,
            lambda h: {"member_id": h["their_guest"].id, "name": "Volee"},
            "member_not_found",
        ),
        (
            "list_expenses",
            lambda: expenses.websocket_list_expenses,
            lambda h: {"group_id": h["theirs"].id},
            "group_not_found",
        ),
        (
            "list_payments",
            lambda: payments.websocket_list_payments,
            lambda h: {"group_id": h["theirs"].id},
            "group_not_found",
        ),
        (
            "list_categories",
            lambda: categories.websocket_list_categories,
            lambda h: {"group_id": h["theirs"].id},
            "group_not_found",
        ),
        (
            "list_members",
            lambda: members.websocket_list_members,
            lambda h: {"group_id": h["theirs"].id},
            "group_not_found",
        ),
        (
            "get_balances",
            lambda: groups.websocket_get_balances,
            lambda h: {"group_id": h["theirs"].id},
            "group_not_found",
        ),
        (
            "get_statistics",
            lambda: statistics.websocket_get_statistics,
            lambda h: {"group_id": h["theirs"].id},
            "group_not_found",
        ),
        (
            "list_revisions",
            lambda: revisions.websocket_list_revisions,
            lambda h: {"group_id": h["theirs"].id},
            "group_not_found",
        ),
        (
            "delete_group",
            lambda: groups.websocket_delete_group,
            lambda h: {"group_id": h["theirs"].id},
            "group_not_found",
        ),
    ],
)
async def test_no_command_reaches_into_another_household(
    loaded: FakeHass,
    household: dict[str, Any],
    manager: SharedExpensesManager,
    name: str,
    handler_of: Any,
    payload_of: Any,
    code: str,
):
    """Every door, one by one: an outsider is turned away at all of them."""

    connection = FakeConnection(MINE)

    await call(
        loaded,
        connection,
        handler_of(),
        {"type": f"shared_expenses/{name}", **payload_of(household)},
    )

    assert connection.errors.get(1, (None,))[0] == code, (
        f"{name} answered {connection.errors.get(1)} / {connection.results.get(1)}"
    )
    assert connection.results == {}

    # Refusal is not enough: nothing must have been done on the way to it.
    assert (await manager.get_group(household["theirs"].id)) is not None
    assert len(await manager.list_expenses(household["theirs"].id)) == 1
    assert len(await manager.list_payments(household["theirs"].id)) == 1
    assert (await manager.get_member(household["their_guest"].id)).name == "Chloe"


async def test_an_expense_cannot_be_created_in_another_household(
    loaded: FakeHass,
    household: dict[str, Any],
    manager: SharedExpensesManager,
):
    connection = FakeConnection(MINE)

    await call(
        loaded,
        connection,
        expenses.websocket_create_expense,
        {
            "type": "shared_expenses/create_expense",
            "group_id": household["theirs"].id,
            "title": "Intrusion",
            "amount": 100,
            "paid_by_member_id": household["their_owner"].id,
            "expense_date": NOW.isoformat(),
        },
    )

    assert connection.errors[1][0] == "group_not_found"
    assert len(await manager.list_expenses(household["theirs"].id)) == 1


async def test_the_history_of_another_household_stays_there(
    loaded: FakeHass,
    household: dict[str, Any],
):
    """Scoped on the group, so naming their expense from my group gets nothing."""

    connection = FakeConnection(MINE)

    await call(
        loaded,
        connection,
        revisions.websocket_list_entity_revisions,
        {
            "type": "shared_expenses/list_entity_revisions",
            "group_id": household["mine"].id,
            "entity_id": household["their_expense"].id,
        },
    )

    assert connection.results[1] == []


#
# What must go through
#


async def test_your_own_group_answers(loaded: FakeHass, household: dict[str, Any]):
    """The wall must not be a wall against its own people."""

    connection = FakeConnection(MINE)

    await call(
        loaded,
        connection,
        groups.websocket_get_group,
        {"type": "shared_expenses/get_group", "group_id": household["mine"].id},
    )

    assert connection.errors == {}
    assert connection.results[1]["name"] == "Appartement"


async def test_creating_an_expense_records_who_did_it(
    loaded: FakeHass,
    household: dict[str, Any],
    manager: SharedExpensesManager,
):
    """The account comes from the connection: nothing the caller can claim."""

    connection = FakeConnection(MINE)

    await call(
        loaded,
        connection,
        expenses.websocket_create_expense,
        {
            "type": "shared_expenses/create_expense",
            "group_id": household["mine"].id,
            "title": "Essence",
            "amount": 4000,
            "paid_by_member_id": household["my_owner"].id,
            "expense_date": NOW.isoformat(),
        },
    )

    assert connection.errors == {}

    created = connection.results[1]
    history = await manager.list_entity_revisions(household["mine"].id, created["id"])

    assert history[0].actor_user_id == MINE


async def test_a_command_answers_when_the_integration_is_not_loaded(
    hass: FakeHass,
    manager: SharedExpensesManager,
):
    """No manager, no crash: the panel must be told rather than left waiting."""

    connection = FakeConnection(MINE)

    await call(
        hass,
        connection,
        groups.websocket_list_groups,
        {"type": "shared_expenses/list_groups"},
    )

    assert connection.errors[1][0] == "not_loaded"


#
# The schemas
#


async def test_every_command_is_registered_once():
    """A command written and never registered is a command that does not exist."""

    names = [command._ws_command for command in COMMANDS]

    assert len(names) == len(set(names)), "a command type is declared twice"
    assert len(names) > 25


@pytest.mark.parametrize(
    ("handler", "payload"),
    [
        (
            lambda: expenses.websocket_create_expense,
            {"type": "shared_expenses/create_expense", "group_id": "g"},
        ),
        (
            lambda: statistics.websocket_get_statistics,
            {"type": "shared_expenses/get_statistics", "group_id": "g", "year": 12},
        ),
        (
            lambda: payments.websocket_create_payment,
            {
                "type": "shared_expenses/create_payment",
                "group_id": "g",
                "from_member_id": "a",
                "to_member_id": "b",
                "amount": "beaucoup",
                "payment_date": NOW.isoformat(),
            },
        ),
    ],
)
async def test_a_malformed_message_never_reaches_the_manager(handler, payload):
    """Rejected by the schema, which is where Home Assistant rejects it too."""

    import voluptuous as vol

    with pytest.raises(vol.Invalid):
        handler()._ws_schema(payload)
