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
from custom_components.shared_expenses.models import Remainder, SplitRule

STEPHANE = "member-stephane"
ANTONIN = "member-antonin"
CLARA = "member-clara"

EVERYONE = (STEPHANE, ANTONIN, CLARA)
PAIR = (STEPHANE, ANTONIN)


def test_no_rule_splits_everything_equally():
    assert resolve_shares(amount=1000, payer_id=STEPHANE, member_ids=PAIR) == {
        STEPHANE: 500,
        ANTONIN: 500,
    }


def test_an_empty_rule_is_the_equal_split():
    assert resolve_shares(
        amount=1000,
        payer_id=STEPHANE,
        member_ids=PAIR,
        rule=SplitRule(),
    ) == {STEPHANE: 500, ANTONIN: 500}


def test_extra_cents_go_to_the_first_members():
    shares = resolve_shares(amount=1000, payer_id=STEPHANE, member_ids=EVERYONE)

    assert shares == {STEPHANE: 334, ANTONIN: 333, CLARA: 333}
    assert sum(shares.values()) == 1000


def test_the_reference_case():
    """85,42 EUR, 10 EUR shared between two, the rest to whoever paid."""

    shares = resolve_shares(
        amount=8542,
        payer_id=STEPHANE,
        member_ids=EVERYONE,
        rule=SplitRule(envelope=1000, participants=(STEPHANE, ANTONIN)),
    )

    assert shares == {STEPHANE: 8042, ANTONIN: 500}


def test_the_remainder_can_be_spelled_out_member_by_member():
    """Michel and Andre: 12 and 14 out of the 26 left."""

    shares = resolve_shares(
        amount=2600,
        payer_id=STEPHANE,
        member_ids=PAIR,
        rule=SplitRule(
            envelope=0,
            remainder=Remainder(
                members=PAIR,
                fixed={STEPHANE: 1200, ANTONIN: 1400},
            ),
        ),
    )

    assert shares == {STEPHANE: 1200, ANTONIN: 1400}


def test_the_remainder_is_shared_between_the_members_named():
    shares = resolve_shares(
        amount=8542,
        payer_id=STEPHANE,
        member_ids=EVERYONE,
        rule=SplitRule(
            envelope=1000,
            participants=(STEPHANE, ANTONIN),
            remainder=Remainder(members=(STEPHANE, ANTONIN)),
        ),
    )

    assert shares == {STEPHANE: 4271, ANTONIN: 4271}


def test_a_remainder_mixes_amounts_and_equal_shares():
    shares = resolve_shares(
        amount=3000,
        payer_id=STEPHANE,
        member_ids=EVERYONE,
        rule=SplitRule(
            envelope=0,
            remainder=Remainder(members=EVERYONE, fixed={CLARA: 1000}),
        ),
    )

    assert shares == {CLARA: 1000, STEPHANE: 1000, ANTONIN: 1000}


def test_an_envelope_above_the_amount_leaves_no_remainder():
    assert resolve_shares(
        amount=1000,
        payer_id=STEPHANE,
        member_ids=PAIR,
        rule=SplitRule(envelope=99999),
    ) == {STEPHANE: 500, ANTONIN: 500}


def test_an_envelope_of_zero_sends_everything_to_the_remainder():
    assert resolve_shares(
        amount=5000,
        payer_id=STEPHANE,
        member_ids=PAIR,
        rule=SplitRule(envelope=0),
    ) == {STEPHANE: 5000}


def test_no_participant_sends_the_envelope_to_the_remainder():
    assert resolve_shares(
        amount=5000,
        payer_id=STEPHANE,
        member_ids=PAIR,
        rule=SplitRule(envelope=1000, participants=()),
    ) == {STEPHANE: 5000}


def test_a_member_can_be_in_both_the_envelope_and_the_remainder():
    shares = resolve_shares(
        amount=3000,
        payer_id=STEPHANE,
        member_ids=PAIR,
        rule=SplitRule(envelope=1000, participants=PAIR),
    )

    assert shares == {STEPHANE: 500 + 2000, ANTONIN: 500}


def test_zero_shares_are_dropped():
    shares = resolve_shares(
        amount=5000,
        payer_id=STEPHANE,
        member_ids=EVERYONE,
        rule=SplitRule(envelope=0),
    )

    assert CLARA not in shares
    assert ANTONIN not in shares


def test_shares_always_add_up_to_the_amount():
    for amount in range(1, 300):
        shares = resolve_shares(
            amount=amount,
            payer_id=STEPHANE,
            member_ids=EVERYONE,
            rule=SplitRule(envelope=7, participants=(STEPHANE, ANTONIN)),
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


def test_a_negative_envelope_is_refused():
    with pytest.raises(InvalidSplitRuleError):
        resolve_shares(
            amount=1000,
            payer_id=STEPHANE,
            member_ids=PAIR,
            rule=SplitRule(envelope=-1),
        )


def test_an_unknown_participant_is_refused():
    with pytest.raises(InvalidSplitRuleError):
        resolve_shares(
            amount=1000,
            payer_id=STEPHANE,
            member_ids=PAIR,
            rule=SplitRule(participants=("stranger",)),
        )


def test_an_unknown_remainder_member_is_refused():
    with pytest.raises(InvalidSplitRuleError):
        resolve_shares(
            amount=1000,
            payer_id=STEPHANE,
            member_ids=PAIR,
            rule=SplitRule(envelope=0, remainder=Remainder(members=("stranger",))),
        )


def test_remainder_amounts_above_what_is_left_are_refused():
    with pytest.raises(InvalidSplitRuleError):
        resolve_shares(
            amount=1000,
            payer_id=STEPHANE,
            member_ids=PAIR,
            rule=SplitRule(
                envelope=0,
                remainder=Remainder(members=PAIR, fixed={ANTONIN: 5000}),
            ),
        )


def test_remainder_amounts_that_do_not_add_up_are_refused():
    """Everyone named carries an amount, so they must cover what is left."""

    with pytest.raises(InvalidSplitRuleError):
        resolve_shares(
            amount=1000,
            payer_id=STEPHANE,
            member_ids=PAIR,
            rule=SplitRule(
                envelope=0,
                remainder=Remainder(members=PAIR, fixed={STEPHANE: 100, ANTONIN: 100}),
            ),
        )


def test_a_negative_remainder_amount_is_refused():
    with pytest.raises(InvalidSplitRuleError):
        resolve_shares(
            amount=1000,
            payer_id=STEPHANE,
            member_ids=PAIR,
            rule=SplitRule(
                envelope=0,
                remainder=Remainder(members=PAIR, fixed={ANTONIN: -100}),
            ),
        )


def test_nobody_taking_the_remainder_is_refused():
    with pytest.raises(InvalidSplitRuleError):
        resolve_shares(
            amount=1000,
            payer_id=STEPHANE,
            member_ids=PAIR,
            rule=SplitRule(envelope=0, remainder=Remainder(members=())),
        )


def test_json_round_trip():
    rule = SplitRule(
        envelope=1000,
        participants=(STEPHANE,),
        remainder=Remainder(members=PAIR, fixed={ANTONIN: 250}),
    )

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


def test_a_boolean_is_not_an_amount():
    with pytest.raises(InvalidSplitRuleError):
        rule_from_dict({"envelope": True})
