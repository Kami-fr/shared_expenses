"""Serialization of the domain model for the frontend."""

from __future__ import annotations

from typing import Any

from ..helpers.balances import GroupBalances, Settlement
from ..helpers.splits import rule_to_dict
from ..models import (
    Category,
    Expense,
    ExpenseShare,
    Group,
    GroupMember,
    Member,
    Payment,
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
        "created_at": group.created_at.isoformat(),
        "split_rule": rule_to_dict(group.split_rule),
    }


def member_to_dict(member: Member) -> dict[str, Any]:
    """Return the serialized form of a member."""

    return {
        "id": member.id,
        "user_id": member.user_id,
        "name": member.name,
        "color": member.color,
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
        "payment_date": payment.payment_date.isoformat(),
        "created_at": payment.created_at.isoformat(),
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
