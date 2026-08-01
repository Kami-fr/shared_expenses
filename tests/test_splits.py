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


def test_an_amount_of_nothing_is_refused():
    """Zero is not a small expense, it is no expense."""

    with pytest.raises(InvalidSplitRuleError):
        resolve_shares(amount=0, payer_id=STEPHANE, member_ids=PAIR)


def test_a_refund_splits_the_way_the_expense_did():
    """A shop giving 30 back undoes 30 spent, share for share."""

    rule = SplitRule(envelope=1000, participants=PAIR)

    spent = resolve_shares(
        amount=3000,
        payer_id=STEPHANE,
        member_ids=PAIR,
        rule=rule,
    )

    given_back = resolve_shares(
        amount=-3000,
        payer_id=STEPHANE,
        member_ids=PAIR,
        rule=rule,
    )

    assert given_back == {member_id: -share for member_id, share in spent.items()}
    assert sum(given_back.values()) == -3000


def test_a_refund_reads_its_rule_on_what_came_back():
    """The figures of a rule are sizes: an envelope of 10 is 10 of the refund."""

    shares = resolve_shares(
        amount=-2500,
        payer_id=STEPHANE,
        member_ids=PAIR,
        rule=SplitRule(envelope=1000, participants=PAIR),
    )

    # 10 shared between the two, and the 15 left back to whoever was refunded.
    assert shares == {STEPHANE: -2000, ANTONIN: -500}


def test_a_refund_that_does_not_divide_evenly_still_adds_up():
    """The cents flooring leaves over cannot go missing on the way back."""

    for amount in range(1, 300):
        shares = resolve_shares(
            amount=-amount,
            payer_id=STEPHANE,
            member_ids=EVERYONE,
        )

        assert sum(shares.values()) == -amount


def test_a_rule_a_refund_cannot_honour_is_refused():
    """Refused on the way back for the same reason as on the way out."""

    rule = SplitRule(
        envelope=0,
        remainder=Remainder(members=PAIR, fixed={STEPHANE: 9999}),
    )

    with pytest.raises(InvalidSplitRuleError):
        resolve_shares(amount=-100, payer_id=STEPHANE, member_ids=PAIR, rule=rule)


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

#
# Percentages
#


def test_sixty_forty():
    """The plain case: two people, two shares, no envelope in the way."""

    rule = SplitRule(
        envelope=0,
        remainder=Remainder(members=PAIR, percent={STEPHANE: 6000, ANTONIN: 4000}),
    )

    assert resolve_shares(
        amount=10000, payer_id=STEPHANE, member_ids=PAIR, rule=rule
    ) == {STEPHANE: 6000, ANTONIN: 4000}


def test_a_share_follows_the_amount():
    """The whole point of storing a percentage rather than what it came to."""

    rule = SplitRule(
        envelope=0,
        remainder=Remainder(members=PAIR, percent={STEPHANE: 6000, ANTONIN: 4000}),
    )

    small = resolve_shares(amount=1000, payer_id=STEPHANE, member_ids=PAIR, rule=rule)
    large = resolve_shares(amount=50000, payer_id=STEPHANE, member_ids=PAIR, rule=rule)

    assert small == {STEPHANE: 600, ANTONIN: 400}
    assert large == {STEPHANE: 30000, ANTONIN: 20000}


def test_the_cents_flooring_loses_are_not_lost():
    """999 split 60/40 is 599.4 and 399.6: someone must take the odd cent."""

    rule = SplitRule(
        envelope=0,
        remainder=Remainder(members=PAIR, percent={STEPHANE: 6000, ANTONIN: 4000}),
    )

    shares = resolve_shares(amount=999, payer_id=STEPHANE, member_ids=PAIR, rule=rule)

    assert sum(shares.values()) == 999
    assert shares == {STEPHANE: 600, ANTONIN: 399}


def test_three_thirds_of_a_hundred():
    """A third cannot be written exactly; the total must still be exact."""

    rule = SplitRule(
        envelope=0,
        remainder=Remainder(
            members=EVERYONE,
            percent={STEPHANE: 3333, ANTONIN: 3333, CLARA: 3334},
        ),
    )

    shares = resolve_shares(
        amount=10000, payer_id=STEPHANE, member_ids=EVERYONE, rule=rule
    )

    assert sum(shares.values()) == 10000
    assert shares == {STEPHANE: 3333, ANTONIN: 3333, CLARA: 3334}


def test_shares_short_of_the_whole_leave_the_rest_to_whoever_is_left():
    """70% named, and one member with nothing written against them."""

    rule = SplitRule(
        envelope=0,
        remainder=Remainder(members=EVERYONE, percent={STEPHANE: 5000, ANTONIN: 2000}),
    )

    shares = resolve_shares(
        amount=10000, payer_id=STEPHANE, member_ids=EVERYONE, rule=rule
    )

    assert shares == {STEPHANE: 5000, ANTONIN: 2000, CLARA: 3000}


def test_shares_short_of_the_whole_with_nobody_left_is_refused():
    """80% of an expense is not an expense: the last fifth belongs to someone."""

    rule = SplitRule(
        envelope=0,
        remainder=Remainder(members=PAIR, percent={STEPHANE: 6000, ANTONIN: 2000}),
    )

    with pytest.raises(InvalidSplitRuleError):
        resolve_shares(amount=10000, payer_id=STEPHANE, member_ids=PAIR, rule=rule)


def test_shares_over_the_whole_are_refused():
    rule = SplitRule(
        envelope=0,
        remainder=Remainder(members=PAIR, percent={STEPHANE: 6000, ANTONIN: 5000}),
    )

    with pytest.raises(InvalidSplitRuleError):
        resolve_shares(amount=10000, payer_id=STEPHANE, member_ids=PAIR, rule=rule)


def test_a_negative_share_is_refused():
    rule = SplitRule(
        envelope=0,
        remainder=Remainder(members=PAIR, percent={STEPHANE: -1000}),
    )

    with pytest.raises(InvalidSplitRuleError):
        resolve_shares(amount=10000, payer_id=STEPHANE, member_ids=PAIR, rule=rule)


def test_a_member_cannot_owe_both_an_amount_and_a_share():
    """Which of the two would win is a question with no honest answer."""

    rule = SplitRule(
        envelope=0,
        remainder=Remainder(
            members=PAIR,
            fixed={STEPHANE: 1000},
            percent={STEPHANE: 5000},
        ),
    )

    with pytest.raises(InvalidSplitRuleError):
        resolve_shares(amount=10000, payer_id=STEPHANE, member_ids=PAIR, rule=rule)


def test_an_amount_and_a_share_side_by_side():
    """Both are taken out of the same thing: what the envelope left."""

    rule = SplitRule(
        envelope=0,
        remainder=Remainder(
            members=EVERYONE,
            fixed={ANTONIN: 1000},
            percent={STEPHANE: 5000},
        ),
    )

    shares = resolve_shares(
        amount=10000, payer_id=STEPHANE, member_ids=EVERYONE, rule=rule
    )

    # Stephane 50% of 100, Antonin his flat 10, Clara what nobody claimed.
    assert shares == {STEPHANE: 5000, ANTONIN: 1000, CLARA: 4000}


def test_a_share_of_what_the_envelope_left():
    """20 shared between the two, then the rest 60/40."""

    rule = SplitRule(
        envelope=2000,
        remainder=Remainder(members=PAIR, percent={STEPHANE: 6000, ANTONIN: 4000}),
    )

    shares = resolve_shares(amount=12000, payer_id=STEPHANE, member_ids=PAIR, rule=rule)

    # 10 each from the envelope; 60 and 40 out of the 100 left.
    assert shares == {STEPHANE: 7000, ANTONIN: 5000}
    assert sum(shares.values()) == 12000


def test_percent_survives_the_json_round_trip():
    rule = SplitRule(
        envelope=0,
        remainder=Remainder(members=PAIR, percent={STEPHANE: 6000, ANTONIN: 4000}),
    )

    assert rule_from_json(rule_to_json(rule)) == rule


def test_a_share_must_be_an_integer():
    """33.33% is 3333, never a float: money that has been through one is lost."""

    with pytest.raises(InvalidSplitRuleError):
        rule_from_dict({"remainder": {"percent": {STEPHANE: 33.33}}})
