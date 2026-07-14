"""Balance computation."""

from __future__ import annotations

from collections.abc import Iterable, Mapping, Sequence
from dataclasses import dataclass

from ..models import Expense, ExpenseShare, Payment


@dataclass(frozen=True, slots=True)
class Settlement:
    """A reimbursement suggested to clear the balances of a group."""

    from_member_id: str
    to_member_id: str

    amount: int


@dataclass(frozen=True, slots=True)
class GroupBalances:
    """Balances of a group, with the reimbursements clearing them."""

    balances: Mapping[str, int]
    settlements: Sequence[Settlement]


def compute_balances(
    *,
    member_ids: Sequence[str],
    expenses: Iterable[Expense],
    shares: Iterable[ExpenseShare],
    payments: Iterable[Payment],
) -> dict[str, int]:
    """Return the net balance in cents of every member.

    A positive balance means the member is owed money, a negative one that the
    member owes money. Members who left the group are still reported when they
    took part in an expense or a payment.
    """

    balances: dict[str, int] = {member_id: 0 for member_id in member_ids}

    def add(member_id: str, amount: int) -> None:
        balances[member_id] = balances.get(member_id, 0) + amount

    for expense in expenses:
        # What it cost the group, not what was handed over at the till: an
        # expense in another currency is only comparable once converted, and
        # the shares below are in the group's currency already.
        add(expense.paid_by_member_id, expense.converted_amount)

    for share in shares:
        add(share.member_id, -share.amount)

    for payment in payments:
        add(payment.from_member_id, payment.amount)
        add(payment.to_member_id, -payment.amount)

    return balances


def simplify_settlements(balances: Mapping[str, int]) -> list[Settlement]:
    """Return a minimal set of reimbursements clearing the balances.

    Debtors and creditors are matched largest first, which clears at least one
    member per reimbursement and therefore needs at most `len(balances) - 1`
    transfers.
    """

    debtors = _sorted_by_amount({m: -b for m, b in balances.items() if b < 0})
    creditors = _sorted_by_amount({m: b for m, b in balances.items() if b > 0})

    settlements: list[Settlement] = []

    debtor_index = 0
    creditor_index = 0

    while debtor_index < len(debtors) and creditor_index < len(creditors):
        debtor, debt = debtors[debtor_index]
        creditor, credit = creditors[creditor_index]

        amount = min(debt, credit)

        if amount > 0:
            settlements.append(
                Settlement(
                    from_member_id=debtor,
                    to_member_id=creditor,
                    amount=amount,
                )
            )

        debtors[debtor_index] = (debtor, debt - amount)
        creditors[creditor_index] = (creditor, credit - amount)

        if debtors[debtor_index][1] == 0:
            debtor_index += 1

        if creditors[creditor_index][1] == 0:
            creditor_index += 1

    return settlements


def _sorted_by_amount(amounts: Mapping[str, int]) -> list[tuple[str, int]]:
    """Sort members by decreasing amount, then by id to stay deterministic."""

    return sorted(amounts.items(), key=lambda item: (-item[1], item[0]))
