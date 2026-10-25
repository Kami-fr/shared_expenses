"""What a revision records having happened."""

from enum import StrEnum


class RevisionAction(StrEnum):
    """The kind of change a revision stands for."""

    CREATED = "created"
    UPDATED = "updated"
    DELETED = "deleted"

    RESTORED = "restored"
    """Brought back from its own deletion, with the id it always had.

    Not a creation: the expense is the one that was there, at its own date, with
    the rate it was frozen at. The line between the deletion and this one is the
    whole of what happened, and it reads as such.
    """

    SKIPPED = "skipped"
    """An occurrence of a recurring expense, passed over rather than confirmed.

    Its own word, not an update: nothing about the recurring expense changed,
    somebody decided that this month's did not happen. The one change it carries
    is `next_due`, from the day passed over to the next.
    """
