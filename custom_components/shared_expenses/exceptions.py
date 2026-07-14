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
    would strand the group with nobody able to open it.
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