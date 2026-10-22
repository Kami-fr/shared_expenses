"""Statistics over the expenses of a group.

Pure functions, like the balances: they read expenses and their shares and
return totals. Nothing here touches the database, so what a figure claims can be
tested on its own.

Payments are deliberately absent from every total. A reimbursement moves money
between members, it does not spend any: counting it would say the household
spent 100 EUR on a 90 EUR shop. They appear in one place only, beside each
member, as what that member handed over and got back: that is what turns "paid
for the group" into "out of my own pocket", and a member's month is not told
without it.
"""

from __future__ import annotations

from collections.abc import Iterable, Sequence
from dataclasses import dataclass
from datetime import datetime

from ..models import Expense, ExpenseShare, Payment, PaymentKind


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

    #: What shops gave back to this member over the period, as a positive
    #: figure. Already netted into `paid`, which is what a refund does to what
    #: somebody paid; kept apart as well so that "paid" can be shown as what
    #: was bought and what came back, rather than one figure hiding both.
    shop_refunds: int = 0

    #: Reimbursements over the period, in the group's currency: money this
    #: member handed to another, and money another handed to them.
    #: `paid + given - received` is what really left their pocket.
    given: int = 0
    received: int = 0

    #: Debts written down over the period: owed to this member, and owed by
    #: them. Kept apart from the reimbursements because a debt is "a loan, or a
    #: debt simply being written down" — often no money moved at all, and a
    #: pocket it never left must not be said to have paid it. The balance
    #: moves all the same: out of pocket, less the share, plus `owed_to`, less
    #: `owed_by`, is how far it moved over the period.
    owed_to: int = 0
    owed_by: int = 0


@dataclass(frozen=True, slots=True)
class GroupStatistics:
    """What a group spent, cut three ways."""

    total: int

    #: How many expenses the total is made of, over the same period. The average
    #: expense is `total / count`, and the panel says so; a reimbursement is not
    #: one of them, exactly as it is not in the total.
    #:
    #: A refund from a shop is not one either, though it *is* in the total. It
    #: comes off what the period cost, which is the whole point of entering it,
    #: but nobody went shopping: counting it would put the average of two trips
    #: over three, and a household that returned everything it bought would have
    #: spent nothing on an ever-growing number of expenses.
    count: int

    by_category: Sequence[CategoryTotal]
    by_month: Sequence[MonthTotal]
    by_member: Sequence[MemberTotal]

    #: Every year holding an expense, for a period picker. Never filtered.
    years: Sequence[int]

    #: Every month holding an expense, chronological. Never filtered either: a
    #: month is read against the ones around it — the one before it, the run of
    #: a year, the average — and a period that cut those away would leave the
    #: month with nothing to be compared to.
    months: Sequence[MonthTotal] = ()


def compute_statistics(
    *,
    expenses: Iterable[Expense],
    shares: Iterable[ExpenseShare],
    payments: Iterable[Payment] = (),
    year: int | None = None,
    month: str | None = None,
) -> GroupStatistics:
    """Return what a group spent, over a month, a year or everything.

    Cut on the date typed on the expense, not on when it was entered: a shop
    backdated to December belongs to December. `month` is `YYYY-MM`, the same
    key `by_month` is written in.
    """

    def in_period(day: datetime) -> bool:
        return (year is None or day.year == year) and (
            month is None or _month_key(day) == month
        )

    everything = list(expenses)
    kept = [e for e in everything if in_period(e.expense_date)]
    ids = {expense.id for expense in kept}

    by_category: dict[str | None, int] = {}
    by_month: dict[str, int] = {}
    paid: dict[str, int] = {}
    refunded: dict[str, int] = {}
    consumed: dict[str, int] = {}

    for expense in kept:
        # Everything here is in the group's currency: a total mixing 100 USD
        # with 100 EUR is not a total of anything.
        cost = expense.converted_amount

        by_category[expense.category_id] = (
            by_category.get(expense.category_id, 0) + cost
        )

        by_month[_month_of(expense)] = by_month.get(_month_of(expense), 0) + cost

        paid[expense.paid_by_member_id] = paid.get(expense.paid_by_member_id, 0) + cost

        # A refund is the purchase the other way, and whoever it was paid back
        # to is its payer: what the shop handed them.
        if cost < 0:
            refunded[expense.paid_by_member_id] = (
                refunded.get(expense.paid_by_member_id, 0) - cost
            )

    for share in shares:
        # The shares of every expense of the group arrive together; only those
        # of the period count, and a share of nothing is not a fact worth a row.
        if share.expense_id not in ids or share.amount == 0:
            continue

        consumed[share.member_id] = consumed.get(share.member_id, 0) + share.amount

    given: dict[str, int] = {}
    received: dict[str, int] = {}
    owed_to: dict[str, int] = {}
    owed_by: dict[str, int] = {}

    for payment in payments:
        if not in_period(payment.payment_date):
            continue

        # `from` is whoever is out of pocket or owed, `to` whoever was paid or
        # owes: the balances' own reading of a payment, kept by kind.
        if payment.kind == PaymentKind.DEBT:
            out, back = owed_to, owed_by
        else:
            out, back = given, received

        # What it came to for the group, as the balances count it.
        out[payment.from_member_id] = (
            out.get(payment.from_member_id, 0) + payment.converted_amount
        )
        back[payment.to_member_id] = (
            back.get(payment.to_member_id, 0) + payment.converted_amount
        )

    return GroupStatistics(
        total=sum(expense.converted_amount for expense in kept),
        # What was actually bought over the period. A reimbursement is no more a
        # count than it is a euro; a refund is a euro back, and still not a
        # shopping trip.
        count=sum(1 for expense in kept if expense.converted_amount > 0),
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
                shop_refunds=refunded.get(member_id, 0),
                given=given.get(member_id, 0),
                received=received.get(member_id, 0),
                owed_to=owed_to.get(member_id, 0),
                owed_by=owed_by.get(member_id, 0),
            )
            for member_id in sorted(
                paid.keys()
                | consumed.keys()
                | given.keys()
                | received.keys()
                | owed_to.keys()
                | owed_by.keys()
            )
        ),
        years=tuple(sorted({e.expense_date.year for e in everything}, reverse=True)),
        months=_months(everything),
    )


def _month_key(day: datetime) -> str:
    """Return the `YYYY-MM` a day is counted in."""

    return f"{day.year:04d}-{day.month:02d}"


def _month_of(expense: Expense) -> str:
    """Return the `YYYY-MM` an expense is counted in, on the date typed."""

    return _month_key(expense.expense_date)


def _months(expenses: Iterable[Expense]) -> tuple[MonthTotal, ...]:
    """Return what every month cost, chronological, refunds netted in."""

    totals: dict[str, int] = {}

    for expense in expenses:
        totals[_month_of(expense)] = (
            totals.get(_month_of(expense), 0) + expense.converted_amount
        )

    return tuple(MonthTotal(month=key, total=totals[key]) for key in sorted(totals))
