"""Group member roles."""

from enum import StrEnum


class GroupRole(StrEnum):
    """Member role inside a group."""

    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"