"""What a payment is saying."""

from enum import StrEnum


class PaymentKind(StrEnum):
    """Why money moved between two members.

    Both move the balances the same way — `from` is whoever is out of pocket —
    and neither is ever counted differently. This is read, not reckoned with.
    """

    REIMBURSEMENT = "reimbursement"
    """`from` settled up with `to`, clearing what they owed."""

    DEBT = "debt"
    """`from` is owed by `to`: a loan, or a debt simply being written down."""
