"""The two resolvers must agree, always.

The split is written twice: in Python, which stores the shares, and in
TypeScript, so the panel can show what a rule comes to before you save it. Two
implementations of the same money is a promise the panel could break silently —
this is what keeps it honest.

It runs the *real* `frontend/src/services/splits.ts`, with only its type
annotations removed, against the real `helpers/splits.py`. Nothing is copied:
a copy would be the thing that drifts.
"""

from __future__ import annotations

import json
from pathlib import Path
import re
import shutil
import subprocess
import sys

import pytest

from custom_components.shared_expenses.exceptions import InvalidSplitRuleError
from custom_components.shared_expenses.helpers.splits import (
    resolve_shares,
    rule_from_dict,
)

ROOT = Path(__file__).resolve().parents[1]
SPLITS_TS = ROOT / "frontend" / "src" / "services" / "splits.ts"
CHECK_JS = Path(__file__).parent / "parity" / "check.mjs"

A, B, C = "mA", "mB", "mC"

#: Every shape a rule can take, including the ones that must be refused.
RULES: list[dict | None] = [
    None,
    {},
    {"envelope": None},
    {"envelope": 0},
    {"envelope": 1},
    {"envelope": 7},
    {"envelope": 1000},
    {"envelope": 999999},
    {"participants": [A]},
    {"participants": []},
    {"participants": [A, B]},
    {"envelope": 1000, "participants": [A, B]},
    {"envelope": 1000, "participants": []},
    # The reference case, and its variations on who takes the rest.
    {"envelope": 1000, "participants": [A, B], "remainder": {"members": [A]}},
    {"envelope": 1000, "participants": [A, B], "remainder": {"members": [A, B]}},
    {"envelope": 1000, "participants": [A, B], "remainder": {"members": [B]}},
    {"envelope": 0, "remainder": {"members": [A, B]}},
    {"envelope": 0, "remainder": {"members": [A, B], "fixed": {A: 1200}}},
    {"envelope": 0, "remainder": {"members": [A, B], "fixed": {A: 1200, B: 1400}}},
    {"envelope": 0, "remainder": {"members": [A, B, C], "fixed": {C: 1000}}},
    {
        "envelope": 500,
        "participants": [C],
        "remainder": {"members": [A], "fixed": {A: 300}},
    },
    {"envelope": 0, "remainder": {"members": []}},
    {"envelope": -1},
    {"envelope": 0, "remainder": {"members": [A], "fixed": {A: -5}}},
    # Percentages, where flooring loses cents someone has to take.
    {"envelope": 0, "remainder": {"members": [A, B], "percent": {A: 6000, B: 4000}}},
    {"envelope": 0, "remainder": {"members": [A, B], "percent": {A: 5000, B: 5000}}},
    {"envelope": 0, "remainder": {"members": [A, B], "percent": {A: 10000}}},
    {"envelope": 0, "remainder": {"members": [A, B], "percent": {A: 3333, B: 6667}}},
    {
        "envelope": 0,
        "remainder": {"members": [A, B, C], "percent": {A: 3333, B: 3333, C: 3334}},
    },
    # Percentages declared in another order than the members. The cents that
    # flooring loses are handed out by position, so both sides have to read the
    # shares in the same order — the panel writes them in the order they were
    # typed, which is rarely the order the group comes in.
    {"envelope": 0, "remainder": {"members": [A, B], "percent": {B: 5000, A: 5000}}},
    {"envelope": 0, "remainder": {"members": [A, B], "percent": {B: 6667, A: 3333}}},
    {
        "envelope": 0,
        "remainder": {"members": [A, B, C], "percent": {C: 3334, A: 3333, B: 3333}},
    },
    # Short of the whole: the last member takes what nobody claimed.
    {"envelope": 0, "remainder": {"members": [A, B], "percent": {A: 6000}}},
    # Short of the whole with nobody left: refused on both sides, or neither.
    {"envelope": 0, "remainder": {"members": [A, B], "percent": {A: 6000, B: 2000}}},
    # Over the whole.
    {"envelope": 0, "remainder": {"members": [A, B], "percent": {A: 6000, B: 5000}}},
    # Negative.
    {"envelope": 0, "remainder": {"members": [A, B], "percent": {A: -6000, B: 4000}}},
    # Both an amount and a share on the same member.
    {
        "envelope": 0,
        "remainder": {"members": [A, B], "fixed": {A: 100}, "percent": {A: 5000}},
    },
    # An amount and a share side by side, on different members.
    {
        "envelope": 0,
        "remainder": {"members": [A, B, C], "fixed": {B: 100}, "percent": {A: 5000}},
    },
    # A share of what the envelope left, rather than of the whole expense.
    {
        "envelope": 1000,
        "remainder": {"members": [A, B], "percent": {A: 6000, B: 4000}},
    },
    {
        "envelope": 500,
        "participants": [A],
        "remainder": {"members": [A, B], "percent": {A: 2500, B: 7500}},
    },
]

#: Amounts that do not divide evenly are where a rounding drift would show.
AMOUNTS = (1, 2, 3, 26, 100, 999, 1000, 1001, 2600, 8542, 123457)

#: Zero, which neither side may resolve, and which no rule makes any different.
NOTHING = 0

GROUPS = ([A, B], [A, B, C], [A])


def build_cases() -> list[dict]:
    """Return every case, with what Python resolves it to."""

    cases: list[dict] = []

    # Every amount both ways round, plus nothing at all. A refund runs the same
    # rules backwards on both sides, and the cent that flooring leaves over has
    # to land on the same member going out as coming back.
    signed = tuple(amount for size in AMOUNTS for amount in (size, -size))

    for amount in (*signed, NOTHING):
        for member_ids in GROUPS:
            for rule in RULES:
                if rule is not None and _names_outsiders(rule, member_ids):
                    continue

                try:
                    expected = resolve_shares(
                        amount=amount,
                        payer_id=A,
                        member_ids=member_ids,
                        rule=rule_from_dict(rule) if rule is not None else None,
                    )
                except InvalidSplitRuleError:
                    # A rule the backend refuses. The panel must refuse it too,
                    # which it says by resolving to null.
                    expected = None

                cases.append(
                    {
                        "amount": amount,
                        "payer_id": A,
                        "member_ids": list(member_ids),
                        "rule": rule,
                        "expected": expected,
                    }
                )

    return cases


def _names_outsiders(rule: dict, member_ids: list[str]) -> bool:
    """Whether a rule speaks of someone the group does not hold.

    Those cases are the business of the tests above, which check both sides
    refuse them. Here they would only crowd out the ones about arithmetic.
    """

    named = set(rule.get("participants") or [])
    remainder = rule.get("remainder") or {}
    named |= set(remainder.get("members") or [])
    named |= set((remainder.get("fixed") or {}).keys())
    named |= set((remainder.get("percent") or {}).keys())

    return bool(named - set(member_ids))


def to_javascript(source: str) -> str:
    """Return splits.ts as runnable JavaScript, changing nothing but the types.

    Deliberately crude: it must not understand TypeScript, only strip what stops
    node from running the very code the panel ships. Anything it fails to strip
    shows up as a syntax error, never as a wrong answer.
    """

    source = source.replace(
        'import type { Remainder, SplitRule } from "../types";', ""
    )
    source = re.sub(r"export interface ResolveInput \{[\s\S]*?\n\}", "", source)

    for annotation in (
        r": ResolveInput",
        r": Record<string, number> \| null",
        r": Record<string, number>",
        r": Remainder \| undefined",
        r": SplitRule",
        r": string\[\] \| null",
        r": string\[\]",
        r": number \| null",
        r": number",
        r": string",
    ):
        source = re.sub(annotation, "", source)

    return source


def test_the_two_resolvers_agree_on_every_case(tmp_path: Path):
    """The whole point: the panel must never promise what the backend refuses."""

    node = shutil.which("node")

    if node is None:
        pytest.skip("node is needed to run the frontend resolver")

    cases = build_cases()

    # A guard on the harness itself: a filter gone wrong would leave this test
    # passing while comparing almost nothing.
    assert len(cases) > 500, f"only {len(cases)} cases were built"

    splits = tmp_path / "splits.mjs"
    splits.write_text(
        to_javascript(SPLITS_TS.read_text(encoding="utf-8")),
        encoding="utf-8",
    )

    payload = tmp_path / "cases.json"
    payload.write_text(json.dumps(cases), encoding="utf-8")

    result = subprocess.run(
        [node, str(CHECK_JS), str(splits), str(payload)],
        capture_output=True,
        text=True,
        check=False,
    )

    assert result.stdout, f"the harness said nothing.\n{result.stderr}"

    report = json.loads(result.stdout)

    assert report["compared"] == len(cases)

    if report["failures"]:
        lines = [
            f"  {f['rule']} on {f['amount']}c, members {f['members']}\n"
            f"    python:     {f['python']}\n"
            f"    typescript: {f['typescript']}"
            for f in report["failures"][:5]
        ]
        pytest.fail(
            f"{len(report['failures'])} of {report['compared']} cases diverge:\n"
            + "\n".join(lines)
        )


def test_the_harness_would_notice_a_divergence(tmp_path: Path):
    """A harness nobody has seen fail is a harness nobody should trust."""

    node = shutil.which("node")

    if node is None:
        pytest.skip("node is needed to run the frontend resolver")

    source = to_javascript(SPLITS_TS.read_text(encoding="utf-8"))

    # Break the resolver on purpose: every share off by one cent.
    broken = source.replace("return shares;", "return sabotage(shares);", 1)

    assert broken != source, "the sabotage no longer applies; check splits.ts"

    broken += """
function sabotage(shares) {
  return Object.fromEntries(
    Object.entries(shares).map(([id, amount]) => [id, amount + 1]),
  );
}
"""

    splits = tmp_path / "splits.mjs"
    splits.write_text(broken, encoding="utf-8")

    payload = tmp_path / "cases.json"
    payload.write_text(json.dumps(build_cases()), encoding="utf-8")

    result = subprocess.run(
        [shutil.which("node"), str(CHECK_JS), str(splits), str(payload)],
        capture_output=True,
        text=True,
        check=False,
    )

    report = json.loads(result.stdout)

    assert report["failures"], "a cent was added to every share and nothing noticed"
    assert result.returncode != 0


if __name__ == "__main__":
    sys.exit(pytest.main([__file__]))
