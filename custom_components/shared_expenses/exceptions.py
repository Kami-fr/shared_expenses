"""Exceptions for Shared Expenses."""

from __future__ import annotations


class SharedExpensesError(Exception):
    """Base exception.

    `code` says *why*, where the class says only what kind of thing went wrong.
    `InvalidExpenseError` is raised ten times over for ten different reasons, and
    the panel translates the class — so every one of them reached a reader as
    "this expense is invalid", while the sentence that would have told them
    something sat unused in the raise.

    Set it and the panel gets that reason instead, as a key it can translate. A
    reason with no translation yet is not a step backwards: the panel falls
    through to the message, so an untranslated cause reads as its English
    sentence rather than as the generic line it reads as today.

    Left unset, everything behaves exactly as before — the class table in
    `websocket/api.py` answers, and no existing raise has to change.
    """

    code: str | None = None

    def __init__(self, *args: object, code: str | None = None) -> None:
        """Raise with an optional reason, finer than the class."""

        super().__init__(*args)

        if code is not None:
            self.code = code


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


class CannotRemoveAdminError(SharedExpensesError):
    """The admin cannot leave their own group.

    Access to a group comes from being a member of it, so letting them out would
    strand the group with nobody able to run it. Handing the group to somebody
    else is the way out, and the only one.
    """


class AdminNeedsAccountError(SharedExpensesError):
    """A group cannot be handed to somebody who cannot log in.

    A member without a Home Assistant account carries expenses but never opens
    the panel. Made admin, they would hold every right nobody can exercise, and
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


class CurrencyLockedError(SharedExpensesError):
    """A group's currency cannot change once it holds money.

    Every expense and payment stored its figures already converted into the
    group's currency, and nothing here converts them back. Change the currency
    and the same integers would simply be read as another one — 40,00 € becoming
    40,00 $ with nobody told. It is settled once, while the group is still empty,
    and from then on it is the unit the whole history is written in.
    """


class InvalidExchangeRateError(SharedExpensesError):
    """Exchange rate is missing, malformed or not plausible."""


#
# Storage
#


class DatabaseNotReadyError(SharedExpensesError):
    """The database is not open.

    A moment rather than a mistake, which is why it is raised and not asserted:
    a read still in flight when the entry unloads finds the file closed under
    it. An assert says the same thing until somebody runs Python with `-O`, and
    then says nothing at all — the connection is `None` and the traceback is
    about an attribute. This is also a `SharedExpensesError`, so the coordinator
    can turn it into one lost cycle instead of a stack trace.
    """


class ExchangeRateUnavailableError(SharedExpensesError):
    """No rate could be had for this pair, from anywhere.

    Raised only when the source is unreachable *and* nothing was ever cached:
    the panel then has to ask for one by hand, which is the only honest way out.
    """
