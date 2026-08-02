"""Tests for the actions an automation or a dashboard tile calls.

Driven through the real schemas and the real handlers, the way `test_websocket`
drives the commands: an action is a door like any other, and what it writes has
to be what the panel would have written for the same purchase.
"""

from __future__ import annotations

from collections.abc import Iterator
from datetime import UTC, datetime
from types import SimpleNamespace
from typing import Any
from zoneinfo import ZoneInfo

from homeassistant.exceptions import HomeAssistantError
from homeassistant.util import dt as dt_util
import pytest

from custom_components.shared_expenses import services
from custom_components.shared_expenses.manager import SharedExpensesManager
from tests.conftest import ADMIN, FakeHass

PARIS = ZoneInfo("Europe/Paris")


class FakeServices:
    """Stand-in for `hass.services`, keeping what was registered on it."""

    def __init__(self) -> None:
        """Start with nothing registered."""

        self.registered: dict[str, tuple[Any, Any]] = {}

    def async_register(
        self,
        domain: str,
        service: str,
        handler: Any,
        schema: Any = None,
    ) -> None:
        """Record an action, so a test can call it as Home Assistant would."""

        self.registered[service] = (handler, schema)

    def async_remove(self, domain: str, service: str) -> None:
        """Forget an action."""

        self.registered.pop(service, None)


@pytest.fixture
async def actions(loaded: FakeHass) -> FakeHass:
    """Return a `hass` holding the manager and the registered actions."""

    loaded.services = FakeServices()

    services.async_setup_services(loaded)

    return loaded


@pytest.fixture
def paris() -> Iterator[None]:
    """Put the house on Europe/Paris, where a wall clock is not UTC."""

    before = dt_util.DEFAULT_TIME_ZONE

    dt_util.set_default_time_zone(PARIS)

    yield

    dt_util.set_default_time_zone(before)


async def call(
    hass: FakeHass,
    service: str,
    data: dict[str, Any],
    *,
    user_id: str | None = None,
) -> None:
    """Call an action through its own schema, as the interface does."""

    handler, schema = hass.services.registered[service]

    await handler(
        SimpleNamespace(
            data=schema(data),
            context=SimpleNamespace(user_id=user_id),
        )
    )


async def test_a_date_given_as_a_wall_clock_is_stored_in_utc(
    actions: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
    paris: None,
):
    """The `datetime:` selector sends local time with no zone — ADR-009.

    Stored as it arrived, the same instant read as an hour off everywhere it is
    compared: the list order, the statistics, the day a rate is looked up on.
    """

    await call(
        actions,
        "add_expense",
        {
            "group_id": project["group"].id,
            "title": "Courses",
            "amount": 30.0,
            "paid_by_member_id": project["admin"].id,
            "expense_date": "2026-01-05 11:30:00",
        },
        user_id=ADMIN,
    )

    expense = (await manager.list_expenses(project["group"].id))[0]

    assert expense.expense_date == datetime(2026, 1, 5, 10, 30, tzinfo=UTC)


async def test_a_date_given_with_an_offset_is_kept_as_the_instant_it_is(
    actions: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
    paris: None,
):
    """An automation may write its own offset, and it is the one that counts."""

    await call(
        actions,
        "settle_up",
        {
            "group_id": project["group"].id,
            "from_member_id": project["plain"].id,
            "to_member_id": project["admin"].id,
            "amount": 10.0,
            "payment_date": "2026-01-05T11:30:00+02:00",
        },
        user_id=ADMIN,
    )

    payment = (await manager.list_payments(project["group"].id))[0]

    assert payment.payment_date == datetime(2026, 1, 5, 9, 30, tzinfo=UTC)


async def test_a_date_left_out_is_now(
    actions: FakeHass,
    manager: SharedExpensesManager,
    project: dict[str, Any],
):
    """Nothing here is ever naive, the fallback included."""

    await call(
        actions,
        "add_expense",
        {
            "group_id": project["group"].id,
            "title": "Courses",
            "amount": 30.0,
            "paid_by_member_id": project["admin"].id,
        },
        user_id=ADMIN,
    )

    expense = (await manager.list_expenses(project["group"].id))[0]

    assert expense.expense_date.tzinfo is not None


async def test_a_mistyped_project_is_reported_rather_than_thrown(
    actions: FakeHass,
    project: dict[str, Any],
):
    """The ids are copied by hand, so one character wrong is the common case."""

    with pytest.raises(HomeAssistantError):
        await call(
            actions,
            "settle_up",
            {
                "group_id": "not-a-group",
                "from_member_id": project["plain"].id,
                "to_member_id": project["admin"].id,
                "amount": 10.0,
            },
            user_id=ADMIN,
        )


async def test_an_amount_that_rounds_to_nothing_is_reported(
    actions: FakeHass,
    project: dict[str, Any],
):
    """Under half a cent is no expense, and the caller is told so."""

    with pytest.raises(HomeAssistantError):
        await call(
            actions,
            "add_expense",
            {
                "group_id": project["group"].id,
                "title": "Courses",
                "amount": 0.004,
                "paid_by_member_id": project["admin"].id,
            },
            user_id=ADMIN,
        )


async def test_paying_oneself_is_reported(
    actions: FakeHass,
    project: dict[str, Any],
):
    """A business rule broken by hand is a sentence, not a stack trace."""

    with pytest.raises(HomeAssistantError):
        await call(
            actions,
            "settle_up",
            {
                "group_id": project["group"].id,
                "from_member_id": project["admin"].id,
                "to_member_id": project["admin"].id,
                "amount": 10.0,
            },
            user_id=ADMIN,
        )
