"""Tests for a refund that names the purchase it gives money back on.

The link moves nothing: the shares are the money, and naming a purchase changes
no figure anywhere. What it can do is vanish, in two ways that would each read as
the save simply not taking — a field left out of `expense_state`, and a deleted
purchase dragging its refunds' links down with it. Those are what is proved here,
along with the three things a refund is not allowed to name.
"""

from __future__ import annotations

from dataclasses import replace
from datetime import UTC, datetime

import pytest

from custom_components.shared_expenses.exceptions import (
    ExpenseNotFoundError,
    InvalidExpenseError,
)
from custom_components.shared_expenses.helpers.currency import apportion
from custom_components.shared_expenses.manager import SharedExpensesManager

NOW = datetime(2026, 7, 14, 12, 0, tzinfo=UTC)
ADMIN = "user-admin"


async def a_group(manager: SharedExpensesManager):
    """Return a group, its two members, and a 40,00 purchase split between them."""

    group = await manager.create_group(group_name="Appartement", admin_name="Stephane")

    stephane = (await manager.list_group_members(group.id))[0]
    antonin = await manager.create_group_member(group_id=group.id, name="Antonin")

    purchase = await manager.create_expense(
        group_id=group.id,
        title="Restaurant",
        amount=4_000,
        paid_by_member_id=stephane.id,
        expense_date=NOW,
        shares=None,
    )

    return group, stephane, antonin, purchase


async def a_refund(manager: SharedExpensesManager, group, payer, **kwargs):
    """Money the shop gave back, of whatever size, naming whatever is passed."""

    return await manager.create_expense(
        group_id=group.id,
        title="Restaurant, rendu",
        amount=kwargs.pop("amount", -2_000),
        paid_by_member_id=payer.id,
        expense_date=NOW,
        **kwargs,
    )


#
# Naming one, or naming none
#


async def test_a_refund_can_name_the_purchase_it_gives_money_back_on(
    manager: SharedExpensesManager,
):
    group, stephane, _, purchase = await a_group(manager)

    refund = await a_refund(manager, group, stephane, refund_of=purchase.id)

    assert refund.refund_of == purchase.id
    assert (await manager.get_expense(refund.id)).refund_of == purchase.id


async def test_a_refund_need_not_name_anything(manager: SharedExpensesManager):
    """A shop handing money back is often about a basket, not one line of it."""

    group, stephane, _, _ = await a_group(manager)

    assert (await a_refund(manager, group, stephane)).refund_of is None


async def test_naming_a_purchase_moves_no_money(manager: SharedExpensesManager):
    """It says what the money was for. The shares are the money."""

    group, stephane, _, purchase = await a_group(manager)

    refund = await a_refund(manager, group, stephane)
    before = dict((await manager.get_balances(group.id)).balances)

    await manager.update_expense(
        replace(await manager.get_expense(refund.id), refund_of=purchase.id),
        actor_user_id=ADMIN,
    )

    assert dict((await manager.get_balances(group.id)).balances) == before
    assert (await manager.get_expense(refund.id)).refund_of == purchase.id


#
# The three things it cannot name
#


async def test_a_purchase_cannot_give_money_back_on_anything(
    manager: SharedExpensesManager,
):
    """Only a negative amount may carry this, or an expense reads as both."""

    group, stephane, _, purchase = await a_group(manager)

    with pytest.raises(InvalidExpenseError):
        await manager.create_expense(
            group_id=group.id,
            title="Courses",
            amount=1_000,
            paid_by_member_id=stephane.id,
            expense_date=NOW,
            refund_of=purchase.id,
        )


async def test_a_refund_cannot_give_money_back_on_a_refund(
    manager: SharedExpensesManager,
):
    group, stephane, _, purchase = await a_group(manager)

    first = await a_refund(manager, group, stephane, refund_of=purchase.id)

    with pytest.raises(InvalidExpenseError):
        await a_refund(manager, group, stephane, amount=-500, refund_of=first.id)


async def test_a_shop_cannot_hand_back_more_than_it_was_given(
    manager: SharedExpensesManager,
):
    """The refusal that keeps the proportions meaning something.

    The panel opens a refund on the way its purchase was borne, so a figure larger
    than the purchase stretches those proportions past anything they meant: 6,95
    borne 3,48/3,47 -- one cent of rounding -- comes out 7,51/7,49 when pulled to
    15,00, and the rounding reads as an intention nobody had.
    """

    group, stephane, _, purchase = await a_group(manager)

    with pytest.raises(InvalidExpenseError):
        await a_refund(
            manager,
            group,
            stephane,
            amount=-(purchase.amount + 1),
            refund_of=purchase.id,
        )


async def test_the_whole_of_it_can_be_given_back(manager: SharedExpensesManager):
    """The commonest refund there is, and the edge of the refusal above."""

    group, stephane, _, purchase = await a_group(manager)

    refund = await a_refund(
        manager, group, stephane, amount=-purchase.amount, refund_of=purchase.id
    )

    assert refund.amount == -purchase.amount
    assert refund.refund_of == purchase.id


async def test_the_ceiling_is_read_in_the_group_s_own_money(
    manager: SharedExpensesManager,
):
    """A refund need not be in the currency the purchase was paid in.

    40,00 EUR given back as 40,00 USD is not 40,00 of anything the group counts,
    and comparing the two figures as typed would let a refund through that is
    worth more than what it answers -- or refuse one that is not.
    """

    group, stephane, _, purchase = await a_group(manager)

    # A rate of two: every dollar is worth two of the group's euros, so 30,00 USD
    # comes to 60,00 EUR and overflows a 40,00 EUR purchase.
    with pytest.raises(InvalidExpenseError):
        await a_refund(
            manager,
            group,
            stephane,
            amount=-3_000,
            currency="USD",
            exchange_rate=2_000_000,
            refund_of=purchase.id,
        )


async def test_a_purchase_of_another_project_is_out_of_reach(
    manager: SharedExpensesManager,
):
    """The wall, in the one place a new field could have gone through it.

    An id is enough to ask, and without the check the answer would come back: the
    refund would save, and the other household's expense would be confirmed to
    exist by the fact that it did.
    """

    group, stephane, _, _ = await a_group(manager)

    elsewhere = await manager.create_group(group_name="Vacances", admin_name="Clara")
    theirs = (await manager.list_group_members(elsewhere.id))[0]
    hidden = await manager.create_expense(
        group_id=elsewhere.id,
        title="Location",
        amount=90_000,
        paid_by_member_id=theirs.id,
        expense_date=NOW,
    )

    with pytest.raises(InvalidExpenseError):
        await a_refund(manager, group, stephane, refund_of=hidden.id)


async def test_a_purchase_nobody_has_cannot_be_named(manager: SharedExpensesManager):
    group, stephane, _, _ = await a_group(manager)

    with pytest.raises(ExpenseNotFoundError):
        await a_refund(manager, group, stephane, refund_of="expense-nobody-has")


#
# Changing one's mind
#


async def test_a_link_can_be_put_on_and_taken_off_again(
    manager: SharedExpensesManager,
):
    """The field that would have gone missing quietly.

    An update compares the state before with the state after to decide whether
    anything moved, so a field left out of `expense_state` cannot be changed at
    all: the save is skipped and the caller is told it went fine. `kind` was left
    out of the payment's state exactly this way once, and a debt could not become
    a reimbursement until somebody noticed. Taking the link off is the half that
    breaks first, going from an id to None being the change most easily read as
    "nothing happened".
    """

    group, stephane, _, purchase = await a_group(manager)

    refund = await a_refund(manager, group, stephane, refund_of=purchase.id)

    await manager.update_expense(
        replace(await manager.get_expense(refund.id), refund_of=None),
        actor_user_id=ADMIN,
    )
    assert (await manager.get_expense(refund.id)).refund_of is None

    await manager.update_expense(
        replace(await manager.get_expense(refund.id), refund_of=purchase.id),
        actor_user_id=ADMIN,
    )
    assert (await manager.get_expense(refund.id)).refund_of == purchase.id


#
# Surviving a deletion, on either side
#


async def test_a_restored_refund_still_names_its_purchase(
    manager: SharedExpensesManager,
):
    group, stephane, _, purchase = await a_group(manager)

    refund = await a_refund(manager, group, stephane, refund_of=purchase.id)

    await manager.delete_expense(refund.id, actor_user_id=ADMIN)
    restored = await manager.restore_expense(group.id, refund.id, actor_user_id=ADMIN)

    assert restored.refund_of == purchase.id


async def test_the_link_waits_out_the_purchase_being_deleted(
    manager: SharedExpensesManager,
):
    """Why there is no foreign key on this column.

    A deleted expense really leaves the table -- its revision is the only place it
    still exists -- and comes back under the same id. `ON DELETE SET NULL` would
    cut every refund loose the moment somebody deleted the purchase, and restoring
    it would not tie them again. So the id is held plainly and waits.
    """

    group, stephane, _, purchase = await a_group(manager)

    refund = await a_refund(manager, group, stephane, refund_of=purchase.id)

    await manager.delete_expense(purchase.id, actor_user_id=ADMIN)

    assert (await manager.get_expense(refund.id)).refund_of == purchase.id

    with pytest.raises(ExpenseNotFoundError):
        await manager.get_expense(purchase.id)

    await manager.restore_expense(group.id, purchase.id, actor_user_id=ADMIN)

    assert (await manager.get_expense(refund.id)).refund_of == purchase.id
    assert (await manager.get_expense(purchase.id)).id == purchase.id


#
# The split the panel opens on
#


async def test_the_apportioned_split_is_one_the_backend_stores(
    manager: SharedExpensesManager,
):
    """What the picker fills in has to be a split that saves.

    The panel opens a refund on the purchase's own proportions, worked out by its
    own copy of `apportion` -- the parity harness proves the two copies agree. What
    is proved here is the other half: that the figures either of them produces are
    a split this manager accepts, and that they come back out as they went in.
    """

    group, stephane, antonin, _ = await a_group(manager)

    purchase = await manager.create_expense(
        group_id=group.id,
        title="Restaurant",
        amount=4_000,
        paid_by_member_id=stephane.id,
        expense_date=NOW,
        shares=[
            _share(stephane.id, 3_000),
            _share(antonin.id, 1_000),
        ],
    )

    borne = {
        share.member_id: share.amount
        for share in await manager.get_expense_shares(purchase.id)
    }
    assert borne == {stephane.id: 3_000, antonin.id: 1_000}

    # 20,00 given back on 40,00 shared 30/10 is 15/5.
    spread = apportion(borne, 2_000)
    assert spread == {stephane.id: 1_500, antonin.id: 500}

    refund = await a_refund(
        manager,
        group,
        stephane,
        amount=-2_000,
        refund_of=purchase.id,
        shares=[_share(member_id, -value) for member_id, value in spread.items()],
    )

    stored = {
        share.member_id: share.amount
        for share in await manager.get_expense_shares(refund.id)
    }

    assert stored == {stephane.id: -1_500, antonin.id: -500}
    assert sum(stored.values()) == refund.amount


def _share(member_id: str, amount: int):
    """Build a share to hand to the manager; the ids are placeholders."""

    from custom_components.shared_expenses.models import ExpenseShare

    return ExpenseShare(
        id="",
        expense_id="",
        member_id=member_id,
        amount=amount,
        created_at=NOW,
    )


#
# The door
#


def test_the_schema_lets_a_refund_be_cut_loose():
    """Null has to get through, or nothing can ever be unlinked.

    An update changes only the fields it is sent, so taking a refund off the
    purchase it named is said by sending `refund_of` as null. Typed `cv.string`,
    the schema would have refused that at the door.
    """

    from custom_components.shared_expenses.websocket.expenses import (
        websocket_update_expense,
    )

    update = websocket_update_expense._ws_schema

    base = {"type": "shared_expenses/update_expense", "expense_id": "expense-1"}

    assert update({"id": 1, **base, "refund_of": "expense-2"})["refund_of"] == (
        "expense-2"
    )
    assert update({"id": 2, **base, "refund_of": None})["refund_of"] is None
    assert "refund_of" not in update({"id": 3, **base})
