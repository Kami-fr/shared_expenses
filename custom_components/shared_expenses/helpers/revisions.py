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

from ..helpers.splits import rule_from_dict, rule_to_dict
from ..models import (
    Category,
    Expense,
    ExpenseShare,
    FieldChange,
    Group,
    GroupRole,
    Member,
    Payment,
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
    """Return a payment as plain values.

    Every field that can be edited belongs here, and not only so the history can
    read it: `update_payment` asks this what moved, and returns early when the
    answer is nothing. A field left out is a field that cannot be changed at all
    — the save is skipped, and the caller is told it went fine.
    """

    return {
        "description": payment.description,
        "amount": payment.amount,
        "currency": payment.currency,
        "from_member_id": payment.from_member_id,
        "to_member_id": payment.to_member_id,
        "payment_date": payment.payment_date.isoformat(),
        "kind": str(payment.kind),
        "converted_amount": payment.converted_amount,
    }


def group_state(group: Group) -> dict[str, Any]:
    """Return a group as plain values.

    What can be changed about the group itself, and nothing that belongs to what
    it holds. `currency` is here although it is meant to be settled at creation:
    the command still accepts it, and a change nobody can see is the one worth
    seeing — the history is the only thing standing where a guard is not.
    """

    return {
        "name": group.name,
        "description": group.description,
        "currency": group.currency,
        "archived": group.archived,
        "exposed": group.exposed,
        "default_category_id": group.default_category_id,
        "split_rule": rule_to_dict(group.split_rule),
        # Sorted, so the same set always reads the same way: a set has no order,
        # and an unordered list would show a change every time nothing moved.
        "permissions": sorted(str(permission) for permission in group.permissions),
    }


def category_state(category: Category) -> dict[str, Any]:
    """Return a category as plain values."""

    return {
        "name": category.name,
        "icon": category.icon,
        "color": category.color,
        "split_rule": rule_to_dict(category.split_rule),
    }


def member_state(member: Member, role: GroupRole | None = None) -> dict[str, Any]:
    """Return a member as plain values, with their standing when it is in play.

    The role comes from the membership rather than the member: the same person
    can run one group and merely belong to another, so it is not theirs, it is
    theirs *here*.
    """

    state: dict[str, Any] = {
        "name": member.name,
        "color": member.color,
    }

    if role is not None:
        state["role"] = str(role)

    return state


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


def expense_snapshot(
    expense: Expense,
    shares: Sequence[ExpenseShare],
) -> dict[str, Any]:
    """Return everything needed to build this expense again.

    What `expense_state` says, plus the four things it leaves out because they
    are not worth reading in a history: the money already worked out, the rule
    it came from, and who typed it.

    The rate is the reason this exists. What somebody owes was settled on the
    day they were owed it; restoring an expense by converting it afresh would
    quietly restate the debt at today's rate, which is a different debt. It is
    kept, not recomputed.

    Only ever put on a deletion. It is the last place the expense is written
    down — the row is about to be gone — and none of these fields is shown: a
    deletion takes everything, which is not news field by field.
    """

    return {
        **expense_state(expense, shares),
        "converted_amount": expense.converted_amount,
        "exchange_rate": expense.exchange_rate,
        "rate_as_of": (
            None if expense.rate_as_of is None else expense.rate_as_of.isoformat()
        ),
        "split_rule": rule_to_dict(expense.split_rule),
        "created_by_member_id": expense.created_by_member_id,
    }


def payment_snapshot(payment: Payment) -> dict[str, Any]:
    """Return everything needed to build this payment again.

    Same idea as `expense_snapshot`, and the same reason: the frozen rate.
    """

    return {
        **payment_state(payment),
        "exchange_rate": payment.exchange_rate,
        "rate_as_of": (
            None if payment.rate_as_of is None else payment.rate_as_of.isoformat()
        ),
        "created_by_member_id": payment.created_by_member_id,
    }


def deletion(state: dict[str, Any]) -> tuple[FieldChange, ...]:
    """Return the changes standing for something being deleted.

    The whole state, not an empty list: this is the last place it is written
    down. Nothing here is read out to anybody — a deletion takes every field, so
    saying which is no news — but it is what a restore is built from, and a
    field missing here is a field that comes back wrong or not at all.
    """

    return tuple(
        FieldChange(field=key, before=value, after=None) for key, value in state.items()
    )


def restored(state: dict[str, Any]) -> tuple[FieldChange, ...]:
    """Return the changes standing for something being brought back.

    The mirror of `deletion`: nothing, then everything. Read no more than a
    deletion is — the line says it came back, and the thing itself says the
    rest, now that there is a thing again to look at.
    """

    return creation(state)


def from_changes(changes: Sequence[FieldChange]) -> dict[str, Any]:
    """Return the state a deletion froze, as a plain dict.

    The inverse of `deletion`. Older deletions carry fewer keys than today's do
    — they were written before a snapshot was a thing — so whoever reads this
    has to cope with what is missing rather than assume.
    """

    return {change.field: change.before for change in changes}


def rule_from_state(state: dict[str, Any]) -> Any:
    """Return the split rule a snapshot froze, if it froze one."""

    stored = state.get("split_rule")

    return None if stored is None else rule_from_dict(stored)
