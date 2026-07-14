"""Split rule remainder targets."""

from enum import StrEnum


class RemainderTarget(StrEnum):
    """Where the surplus of a capped split rule is assigned."""

    PAYER = "payer"
