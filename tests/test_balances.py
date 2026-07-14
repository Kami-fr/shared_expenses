"""Tests for the computation of balances."""

from __future__ import annotations

from datetime import UTC, datetime

from custom_components.shared_expenses.helpers.balances import (
    compute_balances,
    simplify_settlements,
)
from custom_components.shared_expenses.models import Expense, ExpenseShare, Payment

STEPHANE = "member-stephane"
ANTONIN = "member-antonin"
CLARA = "member-clara"

NOW = datetime(2026, 7, 14, 12, 0, tzinfo=UTC)


def make_expense(expense_id: str, payer: str, amount: int) -> Expense:
    return Expense(
        id=expense_id,
        group_id="group",
        category_id=None,
        title="Expense",
        description=None,
        amount=amount,
        currency="EUR",
        paid_by_member_id=payer,
        expense_date=NOW,
        created_at=NOW,
    )


def make_share(expense_id: str, member: str, amount: int) -> ExpenseShare:
    return ExpenseShare(
        id=f"{expense_id}-{member}",
        expense_id=expense_id,
        member_id=member,
        amount=amount,
        created_at=NOW,
    )


def make_payment(sender: str, receiver: str, amount: int) -> Payment:
    return Payment(
        id="payment",
        group_id="group",
        description=None,
        from_member_id=sender,
        to_member_id=receiver,
        amount=amount,
        payment_date=NOW,
        created_at=NOW,
    )


def test_a_group_without_activity_is_settled():
    assert compute_balances(
        member_ids=[STEPHANE, ANTONIN],
        expenses=[],
        shares=[],
        payments=[],
    ) == {STEPHANE: 0, ANTONIN: 0}


def test_the_payer_is_owed_what_the_others_consumed():
    balances = compute_balances(
        member_ids=[STEPHANE, ANTONIN, CLARA],
        expenses=[make_expense("e1", STEPHANE, 9000)],
        shares=[
            make_share("e1", STEPHANE, 3000),
            make_share("e1", ANTONIN, 3000),
            make_share("e1", CLARA, 3000),
        ],
        payments=[],
    )

    assert balances == {STEPHANE: 6000, ANTONIN: -3000, CLARA: -3000}


def test_balances_always_add_up_to_zero():
    balances = compute_balances(
        member_ids=[STEPHANE, ANTONIN, CLARA],
        expenses=[make_expense("e1", STEPHANE, 1000), make_expense("e2", CLARA, 501)],
        shares=[
            make_share("e1", ANTONIN, 1000),
            make_share("e2", STEPHANE, 167),
            make_share("e2", ANTONIN, 167),
            make_share("e2", CLARA, 167),
        ],
        payments=[make_payment(ANTONIN, STEPHANE, 400)],
    )

    assert sum(balances.values()) == 0


def test_a_payment_moves_the_balance_towards_zero():
    balances = compute_balances(
        member_ids=[STEPHANE, ANTONIN],
        expenses=[make_expense("e1", STEPHANE, 1000)],
        shares=[make_share("e1", STEPHANE, 500), make_share("e1", ANTONIN, 500)],
        payments=[make_payment(ANTONIN, STEPHANE, 500)],
    )

    assert balances == {STEPHANE: 0, ANTONIN: 0}


def test_a_member_who_left_still_appears():
    """A departed member keeps their debt: they must not vanish from balances."""

    balances = compute_balances(
        member_ids=[STEPHANE],
        expenses=[make_expense("e1", STEPHANE, 1000)],
        shares=[make_share("e1", STEPHANE, 500), make_share("e1", ANTONIN, 500)],
        payments=[],
    )

    assert balances == {STEPHANE: 500, ANTONIN: -500}


def test_settled_balances_need_no_reimbursement():
    assert simplify_settlements({STEPHANE: 0, ANTONIN: 0}) == []


def test_a_single_debtor_pays_the_single_creditor():
    settlements = simplify_settlements({STEPHANE: 2000, ANTONIN: -2000})

    assert len(settlements) == 1
    assert settlements[0].from_member_id == ANTONIN
    assert settlements[0].to_member_id == STEPHANE
    assert settlements[0].amount == 2000


def test_reimbursements_clear_every_balance():
    balances = {STEPHANE: 6000, ANTONIN: -3000, CLARA: -3000}

    cleared = dict(balances)

    for settlement in simplify_settlements(balances):
        cleared[settlement.from_member_id] += settlement.amount
        cleared[settlement.to_member_id] -= settlement.amount

    assert set(cleared.values()) == {0}


def test_the_number_of_transfers_stays_minimal():
    """Matching largest first needs at most one transfer per member, minus one."""

    balances = {"a": 5000, "b": 3000, "c": -4000, "d": -4000}

    settlements = simplify_settlements(balances)

    assert len(settlements) <= len(balances) - 1


def test_the_result_is_deterministic():
    balances = {"a": 1000, "b": 1000, "c": -1000, "d": -1000}

    first = simplify_settlements(balances)
    second = simplify_settlements(dict(reversed(list(balances.items()))))

    assert first == second
