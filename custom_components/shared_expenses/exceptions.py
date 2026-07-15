"""Exceptions for Shared Expenses."""

from __future__ import annotations


class SharedExpensesError(Exception):
    """Base exception."""


#
# Groups
#

class GroupNotFoundError(SharedExpensesError):
    """Group not found."""


class GroupAlreadyExistsError(SharedExpensesError):
    """Group already exists."""


class GroupArchivedError(SharedExpensesError):
    """Group is archived."""


#
# Members
#

class MemberNotFoundError(SharedExpensesError):
    """Member not found."""


class MemberAlreadyExistsError(SharedExpensesError):
    """Member already exists."""


class MemberAlreadyInGroupError(SharedExpensesError):
    """Member already belongs to the group."""


class CannotRemoveOwnerError(SharedExpensesError):
    """The owner cannot leave their own group.

    Access to a group comes from being a member of it, so letting the owner out
    would strand the group with nobody able to open it. Handing the group to
    somebody else is the way out, and the only one.
    """


class OwnerNeedsAccountError(SharedExpensesError):
    """A group cannot be handed to somebody who cannot log in.

    A member without a Home Assistant account carries expenses but never opens
    the panel. Made owner, they would hold every right nobody can exercise, and
    the group would have nobody able to hand it on again.
    """


#
# Permissions
#

class NotAllowedError(SharedExpensesError):
    """The group does not let this member do this.

    Not a not-found: the thing is theirs to see, and refusing to say why would
    only make the panel look broken. What is hidden is what somebody must not
    know exists; what is refused here, they are looking straight at.
    """


#
# Categories
#

class CategoryNotFoundError(SharedExpensesError):
    """Category not found."""


#
# Expenses
#

class ExpenseNotFoundError(SharedExpensesError):
    """Expense not found."""


class InvalidExpenseError(SharedExpensesError):
    """Expense is invalid."""


class InvalidExpenseSharesError(SharedExpensesError):
    """Expense shares are invalid."""


class InvalidSplitRuleError(SharedExpensesError):
    """Split rule is invalid or cannot be resolved."""


#
# Payments
#

class PaymentNotFoundError(SharedExpensesError):
    """Payment not found."""


class InvalidPaymentError(SharedExpensesError):
    """Payment is invalid."""


#
# Currencies
#


class InvalidExchangeRateError(SharedExpensesError):
    """Exchange rate is missing, malformed or not plausible."""


class ExchangeRateUnavailableError(SharedExpensesError):
    """No rate could be had for this pair, from anywhere.

    Raised only when the source is unreachable *and* nothing was ever cached:
    the panel then has to ask for one by hand, which is the only honest way out.
    """
