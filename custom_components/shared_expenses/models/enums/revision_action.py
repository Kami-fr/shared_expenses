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
