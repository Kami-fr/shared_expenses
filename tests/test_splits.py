"""Tests for the resolution of split rules."""

from __future__ import annotations

import pytest

from custom_components.shared_expenses.exceptions import InvalidSplitRuleError
from custom_components.shared_expenses.helpers.splits import (
    resolve_shares,
    rule_from_dict,
    rule_from_json,
    rule_to_dict,
    rule_to_json,
)
from custom_components.shared_expenses.models import RemainderTarget, SplitRule

STEPHANE = "member-stephane"
ANTONIN = "member-antonin"
CLARA = "member-clara"

EVERYONE = [STEPHANE, ANTONIN, CLARA]
PAIR = [STEPHANE, ANTONIN]


def test_no_rule_splits_equally():
    assert resolve_shares(amount=1000, payer_id=STEPHANE, member_ids=PAIR) == {
        STEPHANE: 500,
        ANTONIN: 500,
    }


def test_extra_cents_go_to_the_first_members():
    shares = resolve_shares(amount=1000, payer_id=STEPHANE, member_ids=EVERYONE)

    assert shares == {STEPHANE: 334, ANTONIN: 333, CLARA: 333}
    assert sum(shares.values()) == 1000


def test_capped_envelope_sends_the_surplus_to_the_payer():
    """The reference case: 85,42 EUR with 10 EUR shared, the rest to the payer."""

    shares = resolve_shares(
        amount=8542,
        payer_id=STEPHANE,
        member_ids=PAIR,
        rule=SplitRule(cap=1000, remainder=RemainderTarget.PAYER),
    )

    assert shares == {STEPHANE: 8042, ANTONIN: 500}


def test_cap_applies_to_the_whole_envelope_not_to_each_member():
    shares = resolve_shares(
        amount=8542,
        payer_id=STEPHANE,
        member_ids=PAIR,
        rule=SplitRule(cap=1000),
    )

    assert shares[ANTONIN] == 500


def test_cap_above_the_amount_has_no_effect():
    assert resolve_shares(
        amount=1000,
        payer_id=STEPHANE,
        member_ids=PAIR,
        rule=SplitRule(cap=99999),
    ) == {STEPHANE: 500, ANTONIN: 500}


def test_fixed_amounts_are_taken_before_the_split():
    shares = resolve_shares(
        amount=10000,
        payer_id=STEPHANE,
        member_ids=EVERYONE,
        rule=SplitRule(participants=(STEPHANE, ANTONIN), fixed={CLARA: 2000}),
    )

    assert shares == {CLARA: 2000, STEPHANE: 4000, ANTONIN: 4000}


def test_fixed_amounts_combine_with_a_cap():
    shares = resolve_shares(
        amount=10000,
        payer_id=STEPHANE,
        member_ids=EVERYONE,
        rule=SplitRule(participants=(STEPHANE, ANTONIN), fixed={CLARA: 2000}, cap=3000),
    )

    assert shares == {CLARA: 2000, STEPHANE: 6500, ANTONIN: 1500}
    assert sum(shares.values()) == 10000


def test_a_participant_can_also_have_a_fixed_amount():
    shares = resolve_shares(
        amount=3000,
        payer_id=STEPHANE,
        member_ids=PAIR,
        rule=SplitRule(participants=PAIR, fixed={STEPHANE: 1000}),
    )

    assert shares == {STEPHANE: 2000, ANTONIN: 1000}


def test_no_participant_sends_everything_to_the_payer():
    assert resolve_shares(
        amount=5000,
        payer_id=STEPHANE,
        member_ids=PAIR,
        rule=SplitRule(participants=()),
    ) == {STEPHANE: 5000}


def test_zero_shares_are_dropped():
    shares = resolve_shares(
        amount=5000,
        payer_id=STEPHANE,
        member_ids=EVERYONE,
        rule=SplitRule(participants=(STEPHANE,), fixed={CLARA: 0}),
    )

    assert shares == {STEPHANE: 5000}


def test_shares_always_add_up_to_the_amount():
    for amount in range(1, 200):
        shares = resolve_shares(
            amount=amount,
            payer_id=STEPHANE,
            member_ids=EVERYONE,
            rule=SplitRule(cap=7),
        )

        assert sum(shares.values()) == amount


@pytest.mark.parametrize("amount", [0, -1, -100])
def test_a_non_positive_amount_is_refused(amount: int):
    with pytest.raises(InvalidSplitRuleError):
        resolve_shares(amount=amount, payer_id=STEPHANE, member_ids=PAIR)


def test_a_payer_outside_the_group_is_refused():
    with pytest.raises(InvalidSplitRuleError):
        resolve_shares(amount=1000, payer_id="stranger", member_ids=PAIR)


def test_an_empty_group_is_refused():
    with pytest.raises(InvalidSplitRuleError):
        resolve_shares(amount=1000, payer_id=STEPHANE, member_ids=[])


def test_an_unknown_participant_is_refused():
    with pytest.raises(InvalidSplitRuleError):
        resolve_shares(
            amount=1000,
            payer_id=STEPHANE,
            member_ids=PAIR,
            rule=SplitRule(participants=("stranger",)),
        )


def test_fixed_amounts_above_the_expense_are_refused():
    with pytest.raises(InvalidSplitRuleError):
        resolve_shares(
            amount=1000,
            payer_id=STEPHANE,
            member_ids=PAIR,
            rule=SplitRule(fixed={ANTONIN: 5000}),
        )


def test_a_negative_fixed_amount_is_refused():
    with pytest.raises(InvalidSplitRuleError):
        resolve_shares(
            amount=1000,
            payer_id=STEPHANE,
            member_ids=PAIR,
            rule=SplitRule(fixed={ANTONIN: -100}),
        )


def test_json_round_trip():
    rule = SplitRule(participants=(STEPHANE,), fixed={ANTONIN: 250}, cap=1000)

    assert rule_from_json(rule_to_json(rule)) == rule


def test_none_stays_none():
    assert rule_to_json(None) is None
    assert rule_from_json(None) is None
    assert rule_to_dict(None) is None
    assert rule_from_dict(None) is None


def test_an_empty_dict_is_the_default_rule():
    assert rule_from_dict({}) == SplitRule()


def test_invalid_json_is_refused():
    with pytest.raises(InvalidSplitRuleError):
        rule_from_json("{not json")


def test_an_unknown_remainder_target_is_refused():
    with pytest.raises(InvalidSplitRuleError):
        rule_from_dict({"remainder": "somebody_else"})


def test_a_boolean_is_not_an_amount():
    with pytest.raises(InvalidSplitRuleError):
        rule_from_dict({"fixed": {STEPHANE: True}})
