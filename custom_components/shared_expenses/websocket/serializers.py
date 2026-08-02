"""Serialization of the domain model for the frontend."""

from __future__ import annotations

from datetime import date
from typing import Any

from ..helpers.balances import GroupBalances, Settlement
from ..helpers.splits import rule_to_dict
from ..helpers.statistics import GroupStatistics
from ..models import (
    Category,
    ExchangeRate,
    Expense,
    ExpenseShare,
    Group,
    GroupMember,
    Member,
    Payment,
    Revision,
)


def group_to_dict(group: Group) -> dict[str, Any]:
    """Return the serialized form of a group."""

    return {
        "id": group.id,
        "name": group.name,
        "description": group.description,
        "currency": group.currency,
        "icon": group.icon,
        "color": group.color,
        "archived": group.archived,
        "exposed": group.exposed,
        "created_at": group.created_at.isoformat(),
        "split_rule": rule_to_dict(group.split_rule),
        "default_category_id": group.default_category_id,
        # Sorted, so the same group always serialises the same way: a set has no
        # order of its own, and a list that shuffled between two reads would
        # make every equality test here a coin toss.
        "permissions": sorted(str(permission) for permission in group.permissions),
    }


def member_to_dict(member: Member) -> dict[str, Any]:
    """Return the serialized form of a member."""

    return {
        "id": member.id,
        "user_id": member.user_id,
        "name": member.name,
        "color": member.color,
        "use_ha_avatar": member.use_ha_avatar,
        "created_at": member.created_at.isoformat(),
    }


def group_member_to_dict(group_member: GroupMember) -> dict[str, Any]:
    """Return the serialized form of a membership."""

    return {
        "id": group_member.id,
        "group_id": group_member.group_id,
        "member_id": group_member.member_id,
        "role": group_member.role.value,
        "joined_at": group_member.joined_at.isoformat(),
        "left_at": (
            group_member.left_at.isoformat()
            if group_member.left_at is not None
            else None
        ),
        "created_at": group_member.created_at.isoformat(),
    }


def category_to_dict(category: Category) -> dict[str, Any]:
    """Return the serialized form of a category."""

    return {
        "id": category.id,
        "group_id": category.group_id,
        "name": category.name,
        "icon": category.icon,
        "color": category.color,
        "created_at": category.created_at.isoformat(),
        "split_rule": rule_to_dict(category.split_rule),
    }


def expense_to_dict(
    expense: Expense,
    shares: list[ExpenseShare] | None = None,
) -> dict[str, Any]:
    """Return the serialized form of an expense."""

    data: dict[str, Any] = {
        "id": expense.id,
        "group_id": expense.group_id,
        "category_id": expense.category_id,
        "title": expense.title,
        "description": expense.description,
        "amount": expense.amount,
        "currency": expense.currency,
        "paid_by_member_id": expense.paid_by_member_id,
        "expense_date": expense.expense_date.isoformat(),
        "created_at": expense.created_at.isoformat(),
        # What it cost the group, which is what every figure in the panel is in.
        # `amount` and `currency` are what was handed over at the till.
        "created_by_member_id": expense.created_by_member_id,
        "converted_amount": expense.converted_amount,
        "exchange_rate": expense.exchange_rate,
        "rate_as_of": (
            None if expense.rate_as_of is None else expense.rate_as_of.isoformat()
        ),
        # The purchase this refund gives money back on, or null. No command lists
        # the refunds of one purchase: the panel already holds every expense of
        # the group, so that is a filter rather than another round trip.
        "refund_of": expense.refund_of,
        "split_rule": rule_to_dict(expense.split_rule),
    }

    if shares is not None:
        data["shares"] = [share_to_dict(share) for share in shares]

    return data


def share_to_dict(share: ExpenseShare) -> dict[str, Any]:
    """Return the serialized form of an expense share."""

    return {
        "id": share.id,
        "expense_id": share.expense_id,
        "member_id": share.member_id,
        "amount": share.amount,
        "created_at": share.created_at.isoformat(),
    }


def payment_to_dict(payment: Payment) -> dict[str, Any]:
    """Return the serialized form of a payment."""

    return {
        "id": payment.id,
        "group_id": payment.group_id,
        "description": payment.description,
        "from_member_id": payment.from_member_id,
        "to_member_id": payment.to_member_id,
        "amount": payment.amount,
        "currency": payment.currency,
        "payment_date": payment.payment_date.isoformat(),
        "created_at": payment.created_at.isoformat(),
        "kind": str(payment.kind),
        "expense_id": payment.expense_id,
        "created_by_member_id": payment.created_by_member_id,
        "converted_amount": payment.converted_amount,
        "exchange_rate": payment.exchange_rate,
        "rate_as_of": payment.rate_as_of.isoformat() if payment.rate_as_of else None,
    }


def statistics_to_dict(statistics: GroupStatistics) -> dict[str, Any]:
    """Return the serialized form of a group's statistics.

    Ids, not names: the panel has the members and the categories to put names on
    them, and to say what an expense with no category should be called.
    """

    return {
        "total": statistics.total,
        "count": statistics.count,
        "by_category": [
            {"category_id": item.category_id, "total": item.total}
            for item in statistics.by_category
        ],
        "by_month": [
            {"month": item.month, "total": item.total} for item in statistics.by_month
        ],
        "by_member": [
            {"member_id": item.member_id, "paid": item.paid, "share": item.share}
            for item in statistics.by_member
        ],
        "years": list(statistics.years),
    }


def revision_to_dict(revision: Revision) -> dict[str, Any]:
    """Return the serialized form of a revision.

    The changes carry stored values, ids and all: the panel holds the members
    and categories to name them, and a name frozen here would drift.
    """

    return {
        "id": revision.id,
        "group_id": revision.group_id,
        "entity_type": str(revision.entity_type),
        "entity_id": revision.entity_id,
        "entity_label": revision.entity_label,
        "action": str(revision.action),
        "actor_user_id": revision.actor_user_id,
        "changes": [
            {"field": change.field, "before": change.before, "after": change.after}
            for change in revision.changes
        ],
        "at": revision.at.isoformat(),
    }


def rate_to_dict(rate: ExchangeRate, *, asked_for: date) -> dict[str, Any]:
    """Return the serialized form of an exchange rate.

    `stale` is the whole reason this is not just a number. A rate from another
    day is worth having — far more than a refusal — but only if whoever is
    offered it can see that it is not today's and say no.
    """

    return {
        "base": rate.base,
        "quote": rate.quote,
        "rate": rate.rate,
        "as_of": rate.as_of.isoformat(),
        "source": str(rate.source),
        "stale": rate.as_of != asked_for,
    }


def settlement_to_dict(settlement: Settlement) -> dict[str, Any]:
    """Return the serialized form of a settlement."""

    return {
        "from_member_id": settlement.from_member_id,
        "to_member_id": settlement.to_member_id,
        "amount": settlement.amount,
    }


def balances_to_dict(result: GroupBalances) -> dict[str, Any]:
    """Return the serialized form of the balances of a group."""

    return {
        "balances": [
            {"member_id": member_id, "amount": amount}
            for member_id, amount in result.balances.items()
        ],
        "settlements": [
            settlement_to_dict(settlement) for settlement in result.settlements
        ],
    }
