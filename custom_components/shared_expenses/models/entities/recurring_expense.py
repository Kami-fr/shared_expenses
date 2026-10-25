"""Recurring expense domain model."""

from __future__ import annotations

import calendar
from dataclasses import dataclass
from datetime import date, datetime, timedelta

from ..enums.recurrence_unit import RecurrenceUnit
from .split_rule import SplitRule


@dataclass(frozen=True, slots=True)
class RecurringExpense:
    """An expense that comes back, and when it next will.

    Not money. It is what an occurrence will look like when it falls due, and
    the rhythm it falls due on; an occurrence becomes money only once a member
    confirms it, as an ordinary expense carrying `recurring_id`. Until then it is
    "to confirm", however long that takes — which is how occurrences missed while
    Home Assistant was off are caught up at their own dates.
    """

    id: str
    group_id: str
    category_id: str | None
    title: str
    description: str | None

    amount: int
    """What to propose, in the cents of `currency`. Always more than zero.

    Only a proposal: the electricity is never the same twice, and the confirmed
    expense keeps whatever was confirmed.
    """

    currency: str
    paid_by_member_id: str

    every: int
    """How many `unit`s apart two occurrences are. At least one."""

    unit: RecurrenceUnit

    anchor: date
    """The day of the first occurrence, from which every other one is counted."""

    next_index: int
    """The occurrence waiting to be confirmed or skipped.

    Everything before it was one or the other. Counted from the anchor rather
    than stored as a date: see `occurrence`.
    """

    created_at: datetime

    ends_on: date | None = None
    """The last day an occurrence may fall on, or None to go on for ever."""

    paused: bool = False
    """Nothing is proposed while paused, and nothing is caught up afterwards.

    Resuming starts again from the next occurrence after the day it resumes:
    a pause is a decision that those weeks did not happen.
    """

    announced: date | None = None
    """The day the last due event was fired, so that one goes out per occurrence."""

    created_by_member_id: str | None = None
    """Who set it up. With the payer, whose it is to change without leave."""

    split_rule: SplitRule | None = None
    """The rule to propose, or None for the category's then the group's."""

    def occurrence(self, index: int) -> date:
        """Return the day occurrence `index` falls on, the anchor being 0.

        Counted from the anchor every time, never from the occurrence before.
        Rent on the 31st falls on the 30th in November and the 28th in February;
        walked one month at a time it would stay on the 28th for good, and
        counting from the anchor is what lets March find the 31st again.
        """

        if self.unit is RecurrenceUnit.DAY:
            return self.anchor + timedelta(days=index * self.every)

        if self.unit is RecurrenceUnit.WEEK:
            return self.anchor + timedelta(weeks=index * self.every)

        months = self.anchor.month - 1 + index * self.every
        year = self.anchor.year + months // 12
        month = months % 12 + 1
        last = calendar.monthrange(year, month)[1]

        return date(year, month, min(self.anchor.day, last))

    @property
    def next_due(self) -> date:
        """The day the occurrence waiting for an answer falls on."""

        return self.occurrence(self.next_index)

    @property
    def ended(self) -> bool:
        """Whether every occurrence there will ever be has been answered."""

        return self.ends_on is not None and self.next_due > self.ends_on

    def due_on(self, today: date) -> bool:
        """Whether an occurrence is waiting to be confirmed on `today`."""

        return not self.paused and not self.ended and self.next_due <= today

    def last_due(self, today: date) -> date | None:
        """Return the latest occurrence fallen due on `today`, or None if none waits.

        Not the one waiting for an answer, which is the oldest: rent left
        unanswered since January has a February of its own by the 1st. Worked
        out from the anchor rather than walked, so years of a daily rhythm cost
        no more than a week of it.
        """

        if not self.due_on(today):
            return None

        limit = today if self.ends_on is None else min(today, self.ends_on)

        if self.unit is RecurrenceUnit.MONTH:
            years = limit.year - self.anchor.year
            months = years * 12 + limit.month - self.anchor.month
            index = months // self.every
        else:
            step = self.every * (7 if self.unit is RecurrenceUnit.WEEK else 1)
            index = (limit - self.anchor).days // step

        # A month's clamped day can still be ahead of `limit` within its month.
        if self.occurrence(index) > limit:
            index -= 1

        return self.occurrence(max(index, self.next_index))

    def waiting(self, today: date) -> int:
        """How many occurrences have fallen due on `today` and are unanswered.

        Capped, so that a daily rhythm left alone for years costs nothing to
        count: past a handful, the number on the screen is "many" either way.
        """

        if not self.due_on(today):
            return 0

        count = 0
        index = self.next_index

        while count < 99:
            due = self.occurrence(index)

            if due > today or (self.ends_on is not None and due > self.ends_on):
                break

            count += 1
            index += 1

        return count
