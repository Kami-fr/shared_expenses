"""Reopening an expense must never move the money.

The split editor speaks of equal shares, exact amounts and sharing part of it;
the backend stores an envelope and a remainder. Something has to translate, and
that translation runs in both directions: a stored rule is read back as a mode
when an expense is opened, and written out again when it is saved.

If the two disagree, opening an expense and pressing save — changing nothing —
would quietly restate what everyone owes. Nothing else in the app would notice:
the shares would simply be different, and both sides would think they were
right.

So the round trip is checked here, on the real `split-modes.ts`, against the
real resolver, over every rule the editor can produce.
"""

from __future__ import annotations

import json
from pathlib import Path
import re
import shutil
import subprocess

import pytest

from tests.test_parity import RULES, to_javascript

ROOT = Path(__file__).resolve().parents[1]
MODES_TS = ROOT / "frontend" / "src" / "services" / "split-modes.ts"
SPLITS_TS = ROOT / "frontend" / "src" / "services" / "splits.ts"
CHECK_JS = Path(__file__).parent / "parity" / "roundtrip.mjs"
DEPARTED_JS = Path(__file__).parent / "parity" / "departed.mjs"

A, B, C = "mA", "mB", "mC"

AMOUNTS = (1, 3, 100, 999, 1000, 2600, 8542, 123457)

GROUPS = ([A, B], [A, B, C])


def modes_to_javascript(source: str) -> str:
    """Return split-modes.ts as runnable JavaScript, changing nothing else."""

    source = source.replace('import { parseMoney } from "./format";', "")
    source = source.replace('import type { SplitRule } from "../types";', "")

    # Its interfaces and type aliases, which carry no behaviour.
    source = re.sub(r"export type Mode =[^;]*;", "", source)
    source = re.sub(r"export type Unit =[^;]*;", "", source)
    source = re.sub(
        r"export const FULL_PERCENT = [^;]*;",
        "const FULL_PERCENT = 10000;",
        source,
    )
    source = re.sub(r"export interface ModeState \{[\s\S]*?\n\}", "", source)

    for annotation in (
        r": SplitRule \| null",
        r": ModeState",
        r": Mode",
        r": Unit",
        r": Set<string>",
        r": Record<string, number>",
        r": string\[\] \| null",
        r": string\[\]",
        r": string \| null",
        r": number \| null",
        r": number",
        r": string",
    ):
        source = re.sub(annotation, "", source)

    # parseMoney comes from format.ts, which drags in Intl; the editor only ever
    # feeds it what a money input holds, and this is that.
    source += """
function parseMoney(value) {
  const trimmed = String(value).trim().replace(",", ".");

  if (trimmed === "") {
    return null;
  }

  const amount = Number(trimmed);

  if (!Number.isFinite(amount)) {
    return null;
  }

  return Math.round(amount * 100);
}
"""

    return source


def build_cases() -> list[dict]:
    """Every rule the editor can hold, on amounts that do not divide evenly."""

    cases = []

    for amount in AMOUNTS:
        for member_ids in GROUPS:
            for rule in RULES:
                if rule is not None and _names_outsiders(rule, member_ids):
                    continue

                cases.append(
                    {
                        "amount": amount,
                        "payer_id": A,
                        "member_ids": list(member_ids),
                        "rule": rule,
                    }
                )

    return cases


def _names_outsiders(rule: dict, member_ids: list[str]) -> bool:
    named = set(rule.get("participants") or [])
    remainder = rule.get("remainder") or {}
    named |= set(remainder.get("members") or [])
    named |= set((remainder.get("fixed") or {}).keys())
    named |= set((remainder.get("percent") or {}).keys())

    return bool(named - set(member_ids))


def run(tmp_path: Path, cases: list[dict], modes_source: str) -> dict:
    """Run the round trip in node and return its report."""

    modes = tmp_path / "split-modes.mjs"
    modes.write_text(modes_source, encoding="utf-8")

    splits = tmp_path / "splits.mjs"
    splits.write_text(
        to_javascript(SPLITS_TS.read_text(encoding="utf-8")),
        encoding="utf-8",
    )

    payload = tmp_path / "cases.json"
    payload.write_text(json.dumps(cases), encoding="utf-8")

    result = subprocess.run(
        [shutil.which("node"), str(CHECK_JS), str(modes), str(splits), str(payload)],
        capture_output=True,
        text=True,
        check=False,
    )

    assert result.stdout, f"the harness said nothing.\n{result.stderr}"

    return json.loads(result.stdout)


def reopen(tmp_path: Path, cases: list[dict]) -> list[dict]:
    """Read each rule back as a mode and write it out again, as the editor does."""

    modes = tmp_path / "split-modes.mjs"
    modes.write_text(
        modes_to_javascript(MODES_TS.read_text(encoding="utf-8")),
        encoding="utf-8",
    )

    payload = tmp_path / "cases.json"
    payload.write_text(json.dumps(cases), encoding="utf-8")

    result = subprocess.run(
        [shutil.which("node"), str(DEPARTED_JS), str(modes), str(payload)],
        capture_output=True,
        text=True,
        check=False,
    )

    assert result.stdout, f"the harness said nothing.\n{result.stderr}"

    return json.loads(result.stdout)


def test_a_rule_naming_somebody_gone_is_never_read_as_one_about_everybody(
    tmp_path: Path,
):
    """A member who has left leaves the rule; nobody else is drawn into it."""

    if shutil.which("node") is None:
        pytest.skip("node is needed to run the frontend modules")

    # C has left the group everywhere below: the panel shows A and B, and has no
    # tick for C at all.
    cases = [
        # Equal shares between A and C. Two names over two members is exactly
        # how the rule for "everybody" is written, so B would be signed up for
        # every expense of the category without a box of theirs ever being
        # ticked.
        {
            "rule": {"envelope": None, "participants": [A, C], "remainder": {}},
            "member_ids": [A, B],
            "payer_id": A,
        },
        # An amount shared by everybody, the rest on C alone.
        {
            "rule": {
                "envelope": 1000,
                "participants": None,
                "remainder": {"members": [C]},
            },
            "member_ids": [A, B],
            "payer_id": A,
        },
        # Hand-typed amounts, one of them C's.
        {
            "rule": {
                "envelope": 0,
                "remainder": {"members": [A, C], "fixed": {A: 3000, C: 1000}},
            },
            "member_ids": [A, B],
            "payer_id": A,
        },
    ]

    rewritten = reopen(tmp_path, cases)

    for case, written in zip(cases, rewritten, strict=True):
        rule = written["rule"]

        assert rule is not None
        assert not _names_outsiders(rule, case["member_ids"]), (
            f"{written['mode']} rewrote {case['rule']} as {rule}, "
            "which still names somebody who has left"
        )

    # The one still here keeps the split to themselves rather than sharing it
    # with whoever the rule never mentioned.
    assert rewritten[0]["rule"]["participants"] == [A]

    # Nobody named takes the rest, so it falls to whoever paid — as a rule with
    # no taker at all says it.
    assert rewritten[1]["rule"]["remainder"]["members"] == [A]


def test_reopening_an_expense_leaves_every_share_where_it_was(tmp_path: Path):
    """Open, save, and nobody owes a cent more or less than before."""

    if shutil.which("node") is None:
        pytest.skip("node is needed to run the frontend modules")

    cases = build_cases()

    assert len(cases) > 200, f"only {len(cases)} cases were built"

    report = run(
        tmp_path,
        cases,
        modes_to_javascript(MODES_TS.read_text(encoding="utf-8")),
    )

    assert report["compared"] == len(cases)

    if report["failures"]:
        lines = [
            f"  {f['rule']} read as {f['mode']}, rewritten {f['rewritten']}\n"
            f"    on {f['amount']}c: {f['before']} became {f['after']}"
            for f in report["failures"][:5]
        ]
        pytest.fail(
            f"{len(report['failures'])} of {report['compared']} rules move the "
            "money when reopened:\n" + "\n".join(lines)
        )


def test_the_round_trip_would_notice_a_mode_read_wrong(tmp_path: Path):
    """A check nobody has watched fail is a check nobody should trust."""

    if shutil.which("node") is None:
        pytest.skip("node is needed to run the frontend modules")

    source = modes_to_javascript(MODES_TS.read_text(encoding="utf-8"))

    # Sabotage: every rule reads back as an equal split, which is what a mode
    # detection quietly falling through would do.
    broken = source.replace(
        "export function modeOf(rule) {",
        'export function modeOf(rule) {\n  return "equal";',
        1,
    )

    assert broken != source, "the sabotage no longer applies; check split-modes.ts"

    report = run(tmp_path, build_cases(), broken)

    assert report["failures"], (
        "every rule was read as an equal split and nothing noticed"
    )
