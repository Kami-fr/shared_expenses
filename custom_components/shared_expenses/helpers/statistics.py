"""Statistics over the expenses of a group.

Pure functions, like the balances: they read expenses and their shares and
return totals. Nothing here touches the database, so what a figure claims can be
tested on its own.

Payments are deliberately absent. A reimbursement moves money between members,
it does not spend any: counting it would say the household spent 100 EUR on a
90 EUR shop.
"""

from __future__ import annotations

from collections.abc import Iterable, Sequence
from dataclasses import dataclass

from ..models import Expense, ExpenseShare


@dataclass(frozen=True, slots=True)
class CategoryTotal:
    """What a category cost. `category_id` is None for the uncategorised."""

    category_id: str | None
    total: int


@dataclass(frozen=True, slots=True)
class MonthTotal:
    """What a month cost. `month` is `YYYY-MM`, on the date you typed."""

    month: str
    total: int


@dataclass(frozen=True, slots=True)
class MemberTotal:
    """What a member put in, and what they consumed.

    `paid` is what left their pocket, `share` what was theirs to bear. The two
    differ by exactly the balance they are owed or owe.
    """

    member_id: str
    paid: int
    share: int


@dataclass(frozen=True, slots=True)
class GroupStatistics:
    """What a group spent, cut three ways."""

    total: int

    #: How many expenses the total is made of, over the same period. The average
    #: expense is `total / count`, and the panel says so; a reimbursement is not
    #: one of them, exactly as it is not in the total.
    count: int

    by_category: Sequence[CategoryTotal]
    by_month: Sequence[MonthTotal]
    by_member: Sequence[MemberTotal]

    #: Every year holding an expense, for a period picker. Never filtered.
    years: Sequence[int]


def compute_statistics(
    *,
    expenses: Iterable[Expense],
    shares: Iterable[ExpenseShare],
    year: int | None = None,
) -> GroupStatistics:
    """Return what a group spent, over one year or over everything.

    Cut on the date typed on the expense, not on when it was entered: a shop
    backdated to December belongs to December.
    """

    everything = list(expenses)
    kept = [e for e in everything if year is None or e.expense_date.year == year]
    ids = {expense.id for expense in kept}

    by_category: dict[str | None, int] = {}
    by_month: dict[str, int] = {}
    paid: dict[str, int] = {}
    consumed: dict[str, int] = {}

    for expense in kept:
        # Everything here is in the group's currency: a total mixing 100 USD
        # with 100 EUR is not a total of anything.
        cost = expense.converted_amount

        by_category[expense.category_id] = (
            by_category.get(expense.category_id, 0) + cost
        )

        month = f"{expense.expense_date.year:04d}-{expense.expense_date.month:02d}"
        by_month[month] = by_month.get(month, 0) + cost

        paid[expense.paid_by_member_id] = paid.get(expense.paid_by_member_id, 0) + cost

    for share in shares:
        # The shares of every expense of the group arrive together; only those
        # of the period count, and a share of nothing is not a fact worth a row.
        if share.expense_id not in ids or share.amount == 0:
            continue

        consumed[share.member_id] = consumed.get(share.member_id, 0) + share.amount

    return GroupStatistics(
        total=sum(expense.converted_amount for expense in kept),
        # The expenses of the period, counted as the total counts them: off
        # `kept`, so a reimbursement is no more a count than it is a euro.
        count=len(kept),
        # Biggest first: a ranking is the question being asked of a breakdown.
        by_category=tuple(
            CategoryTotal(category_id=category_id, total=total)
            for category_id, total in sorted(
                by_category.items(),
                key=lambda item: item[1],
                reverse=True,
            )
        ),
        # Chronological, unlike the rest: a run of months is read as time.
        by_month=tuple(
            MonthTotal(month=month, total=by_month[month]) for month in sorted(by_month)
        ),
        by_member=tuple(
            MemberTotal(
                member_id=member_id,
                paid=paid.get(member_id, 0),
                share=consumed.get(member_id, 0),
            )
            for member_id in sorted(paid.keys() | consumed.keys())
        ),
        years=tuple(sorted({e.expense_date.year for e in everything}, reverse=True)),
    )
