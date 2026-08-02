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

from dataclasses import replace
from datetime import UTC, datetime
from typing import Any

import pytest

from custom_components.shared_expenses.manager import SharedExpensesManager
from custom_components.shared_expenses.models import PaymentKind
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
        admin_name="Stephane",
        admin_user_id=MINE,
    )
    theirs = await manager.create_group(
        group_name="Ski",
        admin_name="Bruno",
        admin_user_id=THEIRS,
    )

    my_admin = (await manager.list_group_members(mine.id))[0]
    their_admin = (await manager.list_group_members(theirs.id))[0]

    their_category = await manager.create_category(
        group_id=theirs.id,
        name="Forfaits",
    )

    my_expense = await manager.create_expense(
        group_id=mine.id,
        title="Courses",
        amount=8542,
        paid_by_member_id=my_admin.id,
        expense_date=NOW,
    )
    their_expense = await manager.create_expense(
        group_id=theirs.id,
        title="Forfait",
        amount=40000,
        paid_by_member_id=their_admin.id,
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
        to_member_id=their_admin.id,
        amount=1000,
        payment_date=NOW,
    )

    return {
        "mine": mine,
        "theirs": theirs,
        "my_admin": my_admin,
        "their_admin": their_admin,
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
            # The group is theirs too: naming it is what the command now asks
            # for, and naming it changes nothing — the caller is in neither.
            lambda h: {
                "member_id": h["their_guest"].id,
                "group_id": h["theirs"].id,
                "name": "Volee",
            },
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
            "subscribe_group",
            lambda: groups.websocket_subscribe_group,
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
            "paid_by_member_id": household["their_admin"].id,
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
            "paid_by_member_id": household["my_admin"].id,
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

#
# The door and the model must agree
#


def test_the_schema_accepts_every_field_the_model_holds():
    """The schema is the door, and it must know every field the model does.

    A field the model holds but the door does not is a field nobody can send.
    This is exactly how percentages shipped broken — added to the model, to the
    reader and to both resolvers, and not to the voluptuous schema. Every
    expense carrying a rule was refused with "extra keys not allowed", which
    names the field but says nothing about why.
    """

    from custom_components.shared_expenses.helpers.splits import (
        REMAINDER_KEYS,
        RULE_KEYS,
    )
    from custom_components.shared_expenses.websocket.api import (
        REMAINDER_SCHEMA,
        SPLIT_RULE_SCHEMA,
    )

    def keys_of(schema) -> set[str]:
        return {str(key.schema) for key in schema.schema}

    assert keys_of(SPLIT_RULE_SCHEMA) == set(RULE_KEYS)
    assert keys_of(REMAINDER_SCHEMA) == set(REMAINDER_KEYS)


def test_the_schema_takes_what_the_panel_sends():
    """Every shape the editor can write, through the real schema."""

    from custom_components.shared_expenses.websocket.api import SPLIT_RULE_SCHEMA

    # The panel always serialises the whole shape, empty maps and all.
    written = [
        {
            "envelope": None,
            "participants": None,
            "remainder": {"members": None, "fixed": {}, "percent": {}},
        },
        {
            "envelope": 0,
            "participants": None,
            "remainder": {"members": ["m1", "m2"], "fixed": {"m2": 500}, "percent": {}},
        },
        {
            "envelope": 0,
            "participants": None,
            "remainder": {
                "members": ["m1", "m2"],
                "fixed": {},
                "percent": {"m1": 6000, "m2": 4000},
            },
        },
        {
            "envelope": 1000,
            "participants": ["m1", "m2"],
            "remainder": {"members": ["m1"], "fixed": {}, "percent": {}},
        },
    ]

    for rule in written:
        SPLIT_RULE_SCHEMA(rule)


async def test_a_refund_goes_through_the_real_command(
    loaded: FakeHass,
    household: dict[str, Any],
    manager: SharedExpensesManager,
):
    """The message the panel sends for a refund, against the schema it must pass.

    Through the command rather than the manager, because that is where a sign
    would be refused: a negative amount and negative shares have to survive
    voluptuous before anything is asked of the split.
    """

    connection = FakeConnection(MINE)
    admin = household["my_admin"]
    other = await manager.create_group_member(
        group_id=household["mine"].id,
        name="Antonin",
    )

    await call(
        loaded,
        connection,
        expenses.websocket_create_expense,
        {
            "type": "shared_expenses/create_expense",
            "group_id": household["mine"].id,
            "title": "Retour Decathlon",
            "amount": -3_000,
            "paid_by_member_id": admin.id,
            "expense_date": NOW.isoformat(),
            "shares": [
                {"member_id": admin.id, "amount": -1_500},
                {"member_id": other.id, "amount": -1_500},
            ],
        },
    )

    assert connection.errors == {}

    expense = connection.results[1]

    assert expense["amount"] == -3_000
    assert expense["converted_amount"] == -3_000

    shares = {
        share.member_id: share.amount
        for share in await manager.list_expense_shares(household["mine"].id)
        if share.expense_id == expense["id"]
    }

    assert shares == {admin.id: -1_500, other.id: -1_500}


async def test_a_foreign_expense_goes_through_the_real_command(
    loaded: FakeHass,
    household: dict[str, Any],
    manager: SharedExpensesManager,
):
    """The whole message the panel sends, against the schema it has to pass.

    A rate is given rather than fetched, so nothing here reaches the network:
    the point is the shape of the message and what the split comes to, not the
    day's price of a dollar.
    """

    connection = FakeConnection(MINE)
    admin = household["my_admin"]
    other = await manager.create_group_member(
        group_id=household["mine"].id,
        name="Antonin",
    )

    await call(
        loaded,
        connection,
        expenses.websocket_create_expense,
        {
            "type": "shared_expenses/create_expense",
            "group_id": household["mine"].id,
            "title": "Diner a New York",
            "amount": 10_000,
            "currency": "USD",
            "exchange_rate": 876_810,
            "paid_by_member_id": admin.id,
            "expense_date": NOW.isoformat(),
            "shares": [
                {"member_id": admin.id, "amount": 5_000},
                {"member_id": other.id, "amount": 5_000},
            ],
        },
    )

    assert connection.errors == {}

    expense = connection.results[1]

    # Kept as it was handed over, and counted as what it cost the group.
    assert expense["amount"] == 10_000
    assert expense["currency"] == "USD"
    assert expense["converted_amount"] == 8_768

    # And the halves of the dollars are halves of the euros.
    shares = {
        share.member_id: share.amount
        for share in await manager.list_expense_shares(household["mine"].id)
        if share.expense_id == expense["id"]
    }

    assert shares == {admin.id: 4_384, other.id: 4_384}


async def test_an_expense_can_change_currency(
    loaded: FakeHass,
    household: dict[str, Any],
    manager: SharedExpensesManager,
):
    """An edit that moves an expense to another currency must stick.

    The panel dropped `currency` and `exchange_rate` from its update, so the
    save went through and the expense came back in the old currency. The
    command itself always could: this pins that it does.
    """

    connection = FakeConnection(MINE)

    await call(
        loaded,
        connection,
        expenses.websocket_update_expense,
        {
            "type": "shared_expenses/update_expense",
            "expense_id": household["my_expense"].id,
            "currency": "USD",
            "exchange_rate": 876_810,
        },
    )

    assert connection.errors == {}

    reloaded = await manager.get_expense(household["my_expense"].id)

    assert reloaded.currency == "USD"
    assert reloaded.exchange_rate == 876_810
    assert reloaded.converted_amount != reloaded.amount


async def test_an_expense_edit_answers_with_what_was_saved(
    loaded: FakeHass,
    household: dict[str, Any],
    manager: SharedExpensesManager,
):
    """The reply is the stored expense, not the message that asked for it.

    The handler used to serialise the expense it had built from the message,
    which knows nothing of the converted amount, the rate and the split rule the
    manager works out — so the same payload announced 100 USD = 100 EUR next to
    shares read from the database that said otherwise.
    """

    connection = FakeConnection(MINE)

    await call(
        loaded,
        connection,
        expenses.websocket_update_expense,
        {
            "type": "shared_expenses/update_expense",
            "expense_id": household["my_expense"].id,
            "currency": "USD",
            "exchange_rate": 876_810,
        },
    )

    assert connection.errors == {}

    reloaded = await manager.get_expense(household["my_expense"].id)
    expense = connection.results[1]

    assert expense["currency"] == reloaded.currency
    assert expense["converted_amount"] == reloaded.converted_amount
    assert expense["exchange_rate"] == reloaded.exchange_rate

    # And the shares beside it add up to the amount it announces.
    shared = sum(share["amount"] for share in expense["shares"])

    assert shared == reloaded.converted_amount


async def test_a_group_can_be_renamed_without_touching_its_currency(
    loaded: FakeHass,
    household: dict[str, Any],
    manager: SharedExpensesManager,
):
    """What the group dialog sends on an edit: the name, and nothing else.

    The currency is deliberately absent. It is the unit every share and every
    balance in the group is written in, and changing it converts nothing -- the
    same figures would simply be read in another currency. The dialog shows it
    and does not offer it; this pins that an edit leaves it alone.
    """

    connection = FakeConnection(MINE)

    await call(
        loaded,
        connection,
        groups.websocket_update_group,
        {
            "type": "shared_expenses/update_group",
            "group_id": household["mine"].id,
            "name": "Coloc",
            "description": None,
        },
    )

    assert connection.errors == {}

    reloaded = await manager.get_group(household["mine"].id)

    assert reloaded.name == "Coloc"
    assert reloaded.currency == household["mine"].currency
    assert reloaded.split_rule == household["mine"].split_rule


async def test_a_group_created_deleted_and_created_again(
    loaded: FakeHass,
    household: dict[str, Any],
    manager: SharedExpensesManager,
):
    """Stephane's own sequence, through the command that answered him.

    The panel does not pass an admin: the handler takes the connected account,
    which is the whole point and was also what broke. Nothing below the handler
    would show it -- every manager test left the admin accountless, and a null
    user_id collides with nothing.
    """

    connection = FakeConnection(MINE)

    await call(
        loaded,
        connection,
        groups.websocket_delete_group,
        {"type": "shared_expenses/delete_group", "group_id": household["mine"].id},
    )

    assert connection.errors == {}

    await call(
        loaded,
        connection,
        groups.websocket_create_group,
        {"type": "shared_expenses/create_group", "name": "Coloc", "currency": "EUR"},
        msg_id=2,
    )

    assert connection.errors == {}

    created = connection.results[2]

    assert created["name"] == "Coloc"

    # And it belongs to the account that asked for it, or it would not be
    # listed back to them.
    assert [g.id for g in await manager.list_user_groups(MINE)] == [created["id"]]


async def test_a_payment_carries_a_note(
    loaded: FakeHass,
    household: dict[str, Any],
    manager: SharedExpensesManager,
):
    """A debt says what it is about, and the note survives an edit.

    The column, the model and both schemas always had it; the dialog simply
    never offered it. This drives the whole path the panel does, because the
    schema is what a field forgotten in it dies on.
    """

    connection = FakeConnection(MINE)
    admin = household["my_admin"]
    other = await manager.create_group_member(
        group_id=household["mine"].id,
        name="Antonin",
    )

    await call(
        loaded,
        connection,
        payments.websocket_create_payment,
        {
            "type": "shared_expenses/create_payment",
            "group_id": household["mine"].id,
            "from_member_id": admin.id,
            "to_member_id": other.id,
            "amount": 4_625,
            "payment_date": NOW.isoformat(),
            "description": "Billet de train avance",
            "kind": "debt",
        },
    )

    assert connection.errors == {}

    created = connection.results[1]

    assert created["description"] == "Billet de train avance"
    assert created["kind"] == "debt"

    # And an edit that only touches the note leaves the rest where it was.
    await call(
        loaded,
        connection,
        payments.websocket_update_payment,
        {
            "type": "shared_expenses/update_payment",
            "payment_id": created["id"],
            "description": "Billet de train, aller simple",
        },
        msg_id=2,
    )

    assert connection.errors == {}

    reloaded = await manager.get_payment(created["id"])

    assert reloaded.description == "Billet de train, aller simple"
    assert reloaded.amount == 4_625
    assert reloaded.kind is PaymentKind.DEBT


async def test_a_payment_names_the_expense_it_is_about(
    loaded: FakeHass,
    household: dict[str, Any],
    manager: SharedExpensesManager,
):
    """The link through the whole path the panel takes, and back off again.

    Through the schema on purpose. The column existed once before, in v14, and
    was dropped in v15 having never been read — a field the door does not know
    is a field nobody can send, and it dies there with "extra keys not allowed",
    which names the field and says nothing about why.
    """

    connection = FakeConnection(MINE)
    admin = household["my_admin"]
    other = await manager.create_group_member(
        group_id=household["mine"].id,
        name="Antonin",
    )

    await call(
        loaded,
        connection,
        payments.websocket_create_payment,
        {
            "type": "shared_expenses/create_payment",
            "group_id": household["mine"].id,
            "from_member_id": other.id,
            "to_member_id": admin.id,
            "amount": 4_271,
            "payment_date": NOW.isoformat(),
            "expense_id": household["my_expense"].id,
        },
    )

    assert connection.errors == {}

    created = connection.results[1]

    assert created["expense_id"] == household["my_expense"].id

    # Null and not merely absent: absent means "leave it alone", so taking the
    # link off has to be sayable, and the schema has to allow saying it.
    await call(
        loaded,
        connection,
        payments.websocket_update_payment,
        {
            "type": "shared_expenses/update_payment",
            "payment_id": created["id"],
            "expense_id": None,
        },
        msg_id=2,
    )

    assert connection.errors == {}
    assert (await manager.get_payment(created["id"])).expense_id is None


async def test_a_payment_cannot_name_another_household_s_expense(
    loaded: FakeHass,
    household: dict[str, Any],
):
    """An id is enough to ask with, and this is the door it asks through."""

    connection = FakeConnection(MINE)

    await call(
        loaded,
        connection,
        payments.websocket_create_payment,
        {
            "type": "shared_expenses/create_payment",
            "group_id": household["mine"].id,
            "from_member_id": household["my_admin"].id,
            "to_member_id": household["my_admin"].id,
            "amount": 1_000,
            "payment_date": NOW.isoformat(),
            "expense_id": household["their_expense"].id,
        },
    )

    assert connection.errors != {}


async def test_a_debt_becomes_a_reimbursement(
    loaded: FakeHass,
    household: dict[str, Any],
    manager: SharedExpensesManager,
):
    """Changing only the kind, which answered "fine" and did nothing.

    `update_payment` asks `payment_state` what moved and returns early when the
    answer is nothing. The kind was not in it, so the one field that moves no
    money was also the one field no other field could betray: the write was
    skipped, silently, and the caller was told it went through.
    """

    connection = FakeConnection(MINE)
    admin = household["my_admin"]
    other = await manager.create_group_member(
        group_id=household["mine"].id,
        name="Antonin",
    )

    debt = await manager.create_payment(
        group_id=household["mine"].id,
        from_member_id=admin.id,
        to_member_id=other.id,
        amount=4_625,
        payment_date=NOW,
        kind=PaymentKind.DEBT,
    )

    await call(
        loaded,
        connection,
        payments.websocket_update_payment,
        {
            "type": "shared_expenses/update_payment",
            "payment_id": debt.id,
            "kind": "reimbursement",
        },
    )

    assert connection.errors == {}
    assert (await manager.get_payment(debt.id)).kind is PaymentKind.REIMBURSEMENT


async def test_the_kind_of_a_payment_is_written_down(
    loaded: FakeHass,
    household: dict[str, Any],
    manager: SharedExpensesManager,
):
    """And the history says so, which is the same mechanism seen from the front."""

    connection = FakeConnection(MINE)
    admin = household["my_admin"]
    other = await manager.create_group_member(
        group_id=household["mine"].id,
        name="Antonin",
    )

    debt = await manager.create_payment(
        group_id=household["mine"].id,
        from_member_id=admin.id,
        to_member_id=other.id,
        amount=4_625,
        payment_date=NOW,
        kind=PaymentKind.DEBT,
    )

    await manager.update_payment(
        replace(debt, kind=PaymentKind.REIMBURSEMENT),
        actor_user_id=MINE,
    )

    await call(
        loaded,
        connection,
        revisions.websocket_list_entity_revisions,
        {
            "type": "shared_expenses/list_entity_revisions",
            "group_id": household["mine"].id,
            "entity_id": debt.id,
        },
    )

    # The creation carries a kind too, being part of what a payment is born
    # with. What has to be here is the edit.
    edits = [
        change
        for revision in connection.results[1]
        if revision["action"] == "updated"
        for change in revision["changes"]
        if change["field"] == "kind"
    ]

    assert edits == [{"field": "kind", "before": "debt", "after": "reimbursement"}]


async def test_a_payment_in_another_currency_goes_through(
    loaded: FakeHass,
    household: dict[str, Any],
    manager: SharedExpensesManager,
):
    """The whole message the panel sends for a debt in dollars.

    A rate is given rather than fetched, so nothing here touches the network:
    what is under test is the shape of the message and what it comes to.
    """

    connection = FakeConnection(MINE)
    admin = household["my_admin"]
    other = await manager.create_group_member(
        group_id=household["mine"].id,
        name="Antonin",
    )

    await call(
        loaded,
        connection,
        payments.websocket_create_payment,
        {
            "type": "shared_expenses/create_payment",
            "group_id": household["mine"].id,
            "from_member_id": admin.id,
            "to_member_id": other.id,
            "amount": 5_000,
            "currency": "USD",
            "exchange_rate": 876_810,
            "payment_date": NOW.isoformat(),
            "kind": "debt",
        },
    )

    assert connection.errors == {}

    created = connection.results[1]

    assert created["amount"] == 5_000
    assert created["currency"] == "USD"
    assert created["converted_amount"] == 4_384
    assert created["exchange_rate"] == 876_810

    # And the balances count the euros it came to, not the dollars written on
    # it: 43,84 owed, never 50.
    balances = await manager.get_balances(household["mine"].id)

    assert balances.balances[other.id] == -4_384


async def test_a_payment_edit_answers_with_what_was_saved(
    loaded: FakeHass,
    household: dict[str, Any],
    manager: SharedExpensesManager,
):
    """The reply is the stored payment, not the message that asked for it.

    The handler used to serialise the payment it had built from the message,
    which knows nothing of the converted amount and the rate the manager works
    out — so a handover corrected to 50 USD came back announcing the euros of
    the state before the edit, while the balances counted the new ones.
    """

    connection = FakeConnection(MINE)
    admin = household["my_admin"]
    other = await manager.create_group_member(
        group_id=household["mine"].id,
        name="Antonin",
    )

    reimbursement = await manager.create_payment(
        group_id=household["mine"].id,
        from_member_id=admin.id,
        to_member_id=other.id,
        amount=5_000,
        payment_date=NOW,
    )

    await call(
        loaded,
        connection,
        payments.websocket_update_payment,
        {
            "type": "shared_expenses/update_payment",
            "payment_id": reimbursement.id,
            "currency": "USD",
            "exchange_rate": 876_810,
        },
    )

    assert connection.errors == {}

    reloaded = await manager.get_payment(reimbursement.id)
    payment = connection.results[1]

    assert payment["currency"] == reloaded.currency
    assert payment["converted_amount"] == reloaded.converted_amount
    assert payment["exchange_rate"] == reloaded.exchange_rate


#
# Being told the group moved, which is what a card on a wall lives on
#


async def test_subscribing_says_when_the_group_moved(
    loaded: FakeHass,
    household: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """A member listens, somebody spends, the listener hears.

    The panel never needed this: it reads once and is closed. A card sits on a
    kitchen wall for days, and nothing else would ever tell it.
    """

    connection = FakeConnection(MINE)

    await call(
        loaded,
        connection,
        groups.websocket_subscribe_group,
        {"type": "shared_expenses/subscribe_group", "group_id": household["mine"].id},
    )

    assert connection.errors == {}
    assert connection.messages == [], "subscribing is not news"

    await manager.create_expense(
        group_id=household["mine"].id,
        title="Pain",
        amount=130,
        paid_by_member_id=household["my_admin"].id,
        expense_date=NOW,
        actor_user_id=MINE,
    )

    assert len(connection.messages) == 1


async def test_the_ping_carries_nothing(
    loaded: FakeHass,
    household: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """Not the balances, not what moved: only that something did.

    The design, not an economy. A subscription outlives the check that allowed
    it — somebody dropped from the group would go on hearing this — so what it
    provokes is another `get_balances`, authorized afresh. Put a figure in here
    and that second door stops being asked.
    """

    connection = FakeConnection(MINE)

    await call(
        loaded,
        connection,
        groups.websocket_subscribe_group,
        {"type": "shared_expenses/subscribe_group", "group_id": household["mine"].id},
    )

    await manager.create_expense(
        group_id=household["mine"].id,
        title="Pain",
        amount=130,
        paid_by_member_id=household["my_admin"].id,
        expense_date=NOW,
        actor_user_id=MINE,
    )

    assert connection.messages[0]["event"] is None

    everything = str(connection.messages)

    assert "130" not in everything
    assert "Pain" not in everything


async def test_a_subscriber_hears_nothing_of_another_household(
    loaded: FakeHass,
    household: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """The signal is fired for every group in the house. This one is not deaf.

    It listens to all of them and answers for one, which is exactly the kind of
    filter that gets written the other way round by accident.
    """

    connection = FakeConnection(MINE)

    await call(
        loaded,
        connection,
        groups.websocket_subscribe_group,
        {"type": "shared_expenses/subscribe_group", "group_id": household["mine"].id},
    )

    await manager.create_expense(
        group_id=household["theirs"].id,
        title="Forfait",
        amount=20_000,
        paid_by_member_id=household["their_admin"].id,
        expense_date=NOW,
        actor_user_id=THEIRS,
    )

    assert connection.messages == []


async def test_hanging_up_stops_the_listening(
    loaded: FakeHass,
    household: dict[str, Any],
    manager: SharedExpensesManager,
) -> None:
    """What Home Assistant runs when the browser tab closes.

    Left undone, every card ever opened would go on costing a callback for the
    life of the instance.
    """

    connection = FakeConnection(MINE)

    await call(
        loaded,
        connection,
        groups.websocket_subscribe_group,
        {"type": "shared_expenses/subscribe_group", "group_id": household["mine"].id},
    )

    connection.subscriptions[1]()

    await manager.create_expense(
        group_id=household["mine"].id,
        title="Pain",
        amount=130,
        paid_by_member_id=household["my_admin"].id,
        expense_date=NOW,
        actor_user_id=MINE,
    )

    assert connection.messages == []
