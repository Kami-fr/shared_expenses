"""What a revision records having happened."""

from enum import StrEnum


class RevisionAction(StrEnum):
    """The kind of change a revision stands for."""

    CREATED = "created"
    UPDATED = "updated"
    DELETED = "deleted"
