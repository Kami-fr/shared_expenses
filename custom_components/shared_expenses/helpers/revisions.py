"""Work out what changed, and say it in stored values.

Pure functions: they read two states and return the difference. Nothing here
touches the database, so what a history claims can be tested on its own.

Values are stored exactly as the tables hold them — cents, ids, ISO dates. Ids
are not resolved into names: the panel has the members and the categories to do
that, and a name frozen here would drift the day someone is renamed.
"""

from __future__ import annotations

from collections.abc import Sequence
from typing import Any

from ..models import Expense, ExpenseShare, FieldChange, Payment

#: The fields of an expense worth accounting for.
EXPENSE_FIELDS = (
    "title",
    "description",
    "amount",
    "currency",
    "paid_by_member_id",
    "expense_date",
    "category_id",
)

#: The fields of a payment worth accounting for.
PAYMENT_FIELDS = (
    "description",
    "amount",
    "from_member_id",
    "to_member_id",
    "payment_date",
)


def expense_state(
    expense: Expense,
    shares: Sequence[ExpenseShare] | None = None,
) -> dict[str, Any]:
    """Return an expense as plain values, shares included.

    The shares come along because they are the money: an amount that moved
    without them says nothing about who now owes what.
    """

    state: dict[str, Any] = {
        "title": expense.title,
        "description": expense.description,
        "amount": expense.amount,
        "currency": expense.currency,
        "paid_by_member_id": expense.paid_by_member_id,
        "expense_date": expense.expense_date.isoformat(),
        "category_id": expense.category_id,
    }

    if shares is not None:
        state["shares"] = {share.member_id: share.amount for share in shares}

    return state


def payment_state(payment: Payment) -> dict[str, Any]:
    """Return a payment as plain values."""

    return {
        "description": payment.description,
        "amount": payment.amount,
        "from_member_id": payment.from_member_id,
        "to_member_id": payment.to_member_id,
        "payment_date": payment.payment_date.isoformat(),
    }


def diff(
    before: dict[str, Any],
    after: dict[str, Any],
) -> tuple[FieldChange, ...]:
    """Return the fields that differ, in the order they were given.

    A field missing from one side is not a change: it was not looked at. Only a
    field present on both, holding something else, counts.
    """

    return tuple(
        FieldChange(field=key, before=before[key], after=after[key])
        for key in after
        if key in before and before[key] != after[key]
    )


def creation(state: dict[str, Any]) -> tuple[FieldChange, ...]:
    """Return the changes standing for something coming into being."""

    return tuple(
        FieldChange(field=key, before=None, after=value) for key, value in state.items()
    )


def deletion(state: dict[str, Any]) -> tuple[FieldChange, ...]:
    """Return the changes standing for something being deleted.

    The whole state, not an empty list: this is the last place it is written
    down, and a deletion nobody can look at is the change most worth reading.
    """

    return tuple(
        FieldChange(field=key, before=value, after=None) for key, value in state.items()
    )
