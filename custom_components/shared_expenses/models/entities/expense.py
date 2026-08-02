"""Expense domain model."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime

from .split_rule import SplitRule


@dataclass(frozen=True, slots=True)
class Expense:
    """Represents an expense."""

    id: str

    group_id: str

    category_id: str | None

    title: str
    description: str | None

    amount: int
    """What was actually paid, in the cents of `currency`.

    Negative where a shop gave money back. The same expense run the other way:
    `paid_by_member_id` is then whoever received it, and every share is owed
    backwards, so it comes off what each of them bore. Never zero — that is not
    a small expense, it is no expense.
    """

    currency: str
    """What it was paid in. Not always the group's."""

    paid_by_member_id: str

    expense_date: datetime

    created_at: datetime

    converted_amount: int
    """The same money, in the group's currency, at `exchange_rate`.

    This is what the balances and the statistics count. `amount` is what was
    handed over at the till, and is only ever shown.

    Equal to `amount` when the expense is in the group's own currency, which is
    the overwhelming case and where the rate is one.

    Required, deliberately. A default would let an expense be built without
    saying what it cost the group, and it would then weigh nothing in every
    balance it appears in — silently, which is the only kind of wrong that
    matters here.
    """

    exchange_rate: int = 1_000_000
    """The rate applied, in millionths: 0.87681 is 876_810.

    Frozen. What someone owes was settled on the day they were owed it; a rate
    that moved afterwards is a fact about the market, not about the debt.
    """

    rate_as_of: date | None = None
    """The day the rate is from, or None when no conversion happened.

    Not always the day of the expense: the ECB publishes nothing at the
    weekend, so a Sunday takes Friday's rate. Kept so it can be said out loud.
    """

    created_by_member_id: str | None = None
    """Who entered it, which is not always who paid it.

    Read by one thing only: whether somebody may edit this without the group's
    permission to touch what is not theirs. Entering what your flatmate paid
    must not cost you the right to fix your own typo.

    None where nobody knows — an expense from before this was recorded, and one
    whose creation predates the history itself. It simply means the payer is the
    only one it belongs to.
    """

    split_rule: SplitRule | None = None
    """The rule that produced the shares, with its members spelled out.

    Only ever read to reopen the dialog as it was filled in: the shares are the
    truth, and the balances never look at this.
    """

    refund_of: str | None = None
    """The expense this one gives money back on, when it names one.

    Only a refund may carry it — an expense with a negative `amount` — and even a
    refund need not: a shop handing money back is often about a basket rather than
    one line of it.

    Read, never reckoned with. The balances count the shares, so naming a purchase
    here moves nothing: it says what the money was for, and lets a refund open
    with the split that purchase was borne under.

    A plain id, with no foreign key behind it. A deleted expense really leaves the
    table — its revision is the only place it still exists — and comes back under
    the same id, so the link waits for it rather than being thrown away.
    """