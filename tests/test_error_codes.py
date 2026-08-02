"""Every reason a raise gives must have a sentence in the panel.

`error_code` prefers the `code=` a raise passed over the class it belongs to, so
that ten different `InvalidExpenseError`s stop arriving as one flat "this expense
is invalid". The panel then looks that code up in `EN` and shows the translation.

A code with no key there does not fail: `errorMessage` falls through to the
exception's own English message, which the reader was never meant to see and
which no translation covers. Nothing goes red, and the feature quietly stops
working for seven of the eight languages — which is exactly why this is a test
and not a convention.

Read out of the real sources on both sides, like `test_parity`: a list of codes
kept here would be the thing that drifts.
"""

from __future__ import annotations

import ast
from pathlib import Path
import re

import pytest

from custom_components.shared_expenses.exceptions import (
    InvalidExchangeRateError,
    InvalidSplitRuleError,
    SharedExpensesError,
)
from custom_components.shared_expenses.helpers.currency import rate_from_decimal
from custom_components.shared_expenses.helpers.splits import (
    resolve_shares,
    rule_from_dict,
    rule_from_json,
)
from custom_components.shared_expenses.websocket.api import ERROR_CODES, error_code

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "custom_components" / "shared_expenses"
LOCALIZE_TS = ROOT / "frontend" / "src" / "services" / "localize.ts"

A, B, C = "mA", "mB", "mC"


def _codes_in(path: Path) -> set[str]:
    """Return every code a raise in this module passes.

    Through the syntax tree rather than a regex, because a code is not always
    written where it is raised: `frankfurter` names its two in constants, on
    purpose, since six causes share them.
    """

    tree = ast.parse(path.read_text(encoding="utf-8"))

    constants = {
        target.id: node.value.value
        for node in tree.body
        if isinstance(node, ast.Assign) and isinstance(node.value, ast.Constant)
        for target in node.targets
        if isinstance(target, ast.Name) and isinstance(node.value.value, str)
    }

    found: set[str] = set()

    for node in ast.walk(tree):
        if not isinstance(node, ast.Call):
            continue

        for keyword in node.keywords:
            if keyword.arg != "code":
                continue

            value = keyword.value

            if isinstance(value, ast.Constant) and isinstance(value.value, str):
                found.add(value.value)
            elif isinstance(value, ast.Name) and value.id in constants:
                found.add(constants[value.id])
            else:
                pytest.fail(f"{path.name}: a code that cannot be read statically")

    return found


def _raised_codes() -> set[str]:
    """Return every code raised anywhere in the integration."""

    codes: set[str] = set()

    for path in sorted(PACKAGE.rglob("*.py")):
        codes |= _codes_in(path)

    return codes


def _english_keys() -> set[str]:
    """Return the keys of `EN`, the panel's own source of truth.

    Only that first table: the other seven are `Record<Key, string>`, so `tsc`
    already refuses one that is missing a key. English is where a key can go
    absent without anything complaining.
    """

    source = LOCALIZE_TS.read_text(encoding="utf-8")

    start = source.index("const EN = {")
    end = source.index("export type Key")

    return set(re.findall(r"^  (\w+):", source[start:end], re.MULTILINE))


def test_every_raised_code_has_an_english_sentence() -> None:
    """A code the panel cannot look up is a code that does nothing."""

    missing = sorted(_raised_codes() - _english_keys())

    assert not missing, (
        "These codes are raised but have no key in EN, so the panel would show "
        f"the exception's English text instead: {', '.join(missing)}"
    )


def test_class_codes_have_an_english_sentence() -> None:
    """The same holds for the fallback table, which predates `code=`."""

    missing = sorted(set(ERROR_CODES.values()) - _english_keys())

    assert not missing, ", ".join(missing)


def test_the_raise_outranks_the_class() -> None:
    """What a raise says it is beats what kind of error it is."""

    assert error_code(InvalidSplitRuleError("why", code="split_no_members")) == (
        "split_no_members"
    )

    # And without one, the class still answers as it always did.
    assert error_code(InvalidSplitRuleError("why")) == "invalid_split_rule"


def test_a_code_is_not_inherited() -> None:
    """One raise passing a code must not put it on the class.

    `code` is a class attribute with an instance override, which is the cheap way
    to keep both tables in one place — and would be a trap if the assignment
    landed on the class instead.
    """

    InvalidSplitRuleError("why", code="split_no_members")

    assert InvalidSplitRuleError("other").code is None
    assert SharedExpensesError("other").code is None


@pytest.mark.parametrize(
    ("rule", "expected"),
    [
        # The whole reason for this sweep: each of these used to reach the panel
        # as "this split rule is invalid", and each says something different.
        ({"envelope": -1}, "split_envelope_negative"),
        ({"participants": ["nobody"]}, "split_unknown_member"),
        ({"envelope": 0, "remainder": {"members": []}}, "split_remainder_nobody"),
        (
            {"envelope": 0, "remainder": {"members": [A], "fixed": {A: -1}}},
            "split_fixed_negative",
        ),
        (
            {"envelope": 0, "remainder": {"members": [A], "percent": {A: -1}}},
            "split_percent_negative",
        ),
        (
            {
                "envelope": 0,
                "remainder": {"members": [A, B], "percent": {A: 6000, B: 6000}},
            },
            "split_percent_over",
        ),
        (
            {"envelope": 0, "remainder": {"members": [A], "fixed": {A: 999_999}}},
            "split_remainder_exceeds",
        ),
        (
            {"envelope": 0, "remainder": {"members": [A], "percent": {A: 5000}}},
            "split_remainder_short",
        ),
        (
            {
                "envelope": 0,
                "remainder": {
                    "members": [A],
                    "fixed": {A: 100},
                    "percent": {A: 5000},
                },
            },
            "split_both_amount_and_share",
        ),
    ],
)
def test_each_split_refusal_says_which(rule: dict, expected: str) -> None:
    """Every refusal a rule can earn carries its own reason."""

    with pytest.raises(InvalidSplitRuleError) as raised:
        resolve_shares(
            amount=1000,
            payer_id=A,
            member_ids=(A, B, C),
            rule=rule_from_dict(rule),
        )

    assert raised.value.code == expected


def test_the_pool_itself_can_be_refused() -> None:
    """The two refusals that are about the group rather than the rule."""

    with pytest.raises(InvalidSplitRuleError) as empty:
        resolve_shares(amount=1000, payer_id=A, member_ids=())

    assert empty.value.code == "split_no_members"

    with pytest.raises(InvalidSplitRuleError) as stranger:
        resolve_shares(amount=1000, payer_id="mZ", member_ids=(A, B))

    assert stranger.value.code == "split_payer_not_member"

    with pytest.raises(InvalidSplitRuleError) as nothing:
        resolve_shares(amount=0, payer_id=A, member_ids=(A, B))

    # The manager's own name for it: one cause, one sentence, whichever of the
    # two notices first.
    assert nothing.value.code == "expense_amount_zero"


@pytest.mark.parametrize(
    ("typed", "expected"),
    [
        ("", "rate_needed"),
        ("   ", "rate_needed"),
        ("abc", "rate_not_a_rate"),
        (".", "rate_not_a_rate"),
        ("0", "rate_not_positive"),
        ("-1", "rate_not_positive"),
        ("20000", "rate_implausible"),
        ("1.1234567", "rate_too_precise"),
    ],
)
def test_each_rate_refusal_says_which(typed: str, expected: str) -> None:
    """A typed rate is refused for a stated reason."""

    with pytest.raises(InvalidExchangeRateError) as raised:
        rate_from_decimal(typed)

    assert raised.value.code == expected


def test_internal_guards_stay_generic() -> None:
    """Not every raise gets a sentence, and that is the decision.

    A stored rule that will not deserialise, or shares that do not add up after
    resolution, is a bug in this integration and not a choice anybody made.
    Dressing those as advice would tell the reader to fix something that is not
    theirs to fix — so they keep the class's own code, which reads as the
    apology it is.
    """

    with pytest.raises(InvalidSplitRuleError) as raised:
        rule_from_json("{not json")

    assert raised.value.code is None
    assert error_code(raised.value) == "invalid_split_rule"
