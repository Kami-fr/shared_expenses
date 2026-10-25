"""What a recurring expense counts its rhythm in."""

from enum import StrEnum


class RecurrenceUnit(StrEnum):
    """The unit of `RecurringExpense.every`.

    No year: twelve months says it, and a unit that only ever meant twelve of
    another would be one more word to translate for nothing.
    """

    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    """Calendar months, the day of the month held where it can be.

    The 31st falls on the last day of a shorter month and comes back to the 31st
    when the month has one — see `RecurringExpense.occurrence`.
    """
