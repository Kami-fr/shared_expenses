"""What a revision is about."""

from enum import StrEnum


class RevisionEntity(StrEnum):
    """The kind of thing a revision was recorded against."""

    EXPENSE = "expense"
    PAYMENT = "payment"
