"""What a revision is about."""

from enum import StrEnum


class RevisionEntity(StrEnum):
    """The kind of thing a revision was recorded against."""

    EXPENSE = "expense"
    PAYMENT = "payment"

    GROUP = "group"
    """The group itself: its name, its default rule, what it allows."""

    CATEGORY = "category"
    MEMBER = "member"
    """Somebody in the group: their name, their standing, their coming and going.

    A member is global — one per Home Assistant account, across every group — so
    a rename is felt everywhere while the revision belongs to the group that
    asked for it. That is the only group whose journal has any business showing
    it: the others were not party to the decision.
    """
