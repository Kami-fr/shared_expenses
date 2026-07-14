"""The two conversions must agree, always.

Money is converted twice: in Python, which stores the figure, and in TypeScript,
so the panel can show what an expense comes to before it is saved. Two
implementations of the same arithmetic is a promise the panel could break
silently — a cent between them is a figure someone accepted that is not the
figure that lands in the balances.

It runs the real `frontend/src/services/currency.ts` against the real
`helpers/currency.py`. Nothing is copied: a copy is what would drift.
"""

from __future__ import annotations

import json
from pathlib import Path
import re
import shutil
import subprocess

import pytest

from custom_components.shared_expenses.exceptions import InvalidExchangeRateError
from custom_components.shared_expenses.helpers.currency import (
    RATE_ONE,
    convert,
    rate_from_decimal,
    rate_to_decimal,
)

ROOT = Path(__file__).resolve().parents[1]
CURRENCY_TS = ROOT / "frontend" / "src" / "services" / "currency.ts"
CHECK_JS = Path(__file__).parent / "parity" / "currency.mjs"

#: Amounts that do not divide evenly are where a rounding drift would show.
AMOUNTS = (0, 1, 2, 3, 7, 99, 100, 999, 1_000, 1_001, 2_600, 8_542, 123_457, 999_999)

#: Rates that land on a half, and the ones a household would really meet.
RATES = (
    RATE_ONE,
    RATE_ONE // 2,
    1,
    100_000,
    876_810,
    874_890,
    1_100_000,
    2 * RATE_ONE,
    333_333,
    666_667,
)

TYPED = (
    "1",
    "0.5",
    "0,5",
    "0.87681",
    "1.1",
    ".5",
    "2",
    "0.000001",
    "0.1",
    "0.07",
    "",
    "   ",
    "abc",
    "1.2.3",
    "0.1a",
    "0.1234567",
    "0",
    "-1",
)


def to_javascript(source: str) -> str:
    """Return currency.ts as runnable JavaScript, changing nothing but types."""

    for annotation in (
        r": number \| null",
        r": number",
        r": string \| null",
        r": string",
        r": boolean",
    ):
        source = re.sub(annotation, "", source)

    return source


def build_cases() -> list[dict]:
    """Every case, with what Python answers."""

    cases: list[dict] = []

    for amount in AMOUNTS:
        for rate in RATES:
            try:
                expected = convert(amount, rate)
            except InvalidExchangeRateError:
                expected = None

            cases.append(
                {
                    "kind": "convert",
                    "amount": amount,
                    "rate": rate,
                    "expected": expected,
                }
            )

    for text in TYPED:
        try:
            expected = rate_from_decimal(text)
        except InvalidExchangeRateError:
            expected = None

        cases.append({"kind": "parse", "text": text, "expected": expected})

    for rate in RATES:
        cases.append(
            {"kind": "format", "rate": rate, "expected": rate_to_decimal(rate)}
        )

    return cases


def run(tmp_path: Path, cases: list[dict], source: str) -> dict:
    """Run the comparison in node and return its report."""

    module = tmp_path / "currency.mjs"
    module.write_text(source, encoding="utf-8")

    payload = tmp_path / "cases.json"
    payload.write_text(json.dumps(cases), encoding="utf-8")

    result = subprocess.run(
        [shutil.which("node"), str(CHECK_JS), str(module), str(payload)],
        capture_output=True,
        text=True,
        check=False,
    )

    assert result.stdout, f"the harness said nothing.\n{result.stderr}"

    return json.loads(result.stdout)


def test_the_two_conversions_agree_on_every_case(tmp_path: Path):
    """The panel must never show a figure the backend would not store."""

    if shutil.which("node") is None:
        pytest.skip("node is needed to run the frontend module")

    cases = build_cases()

    assert len(cases) > 100, f"only {len(cases)} cases were built"

    report = run(
        tmp_path,
        cases,
        to_javascript(CURRENCY_TS.read_text(encoding="utf-8")),
    )

    assert report["compared"] == len(cases)

    if report["failures"]:
        lines = [
            f"  {f['kind']} {f.get('amount', f.get('text', f.get('rate')))}"
            f" at {f.get('rate')}\n"
            f"    python:     {f['python']}\n"
            f"    typescript: {f['typescript']}"
            for f in report["failures"][:5]
        ]
        pytest.fail(
            f"{len(report['failures'])} of {report['compared']} cases diverge:\n"
            + "\n".join(lines)
        )


def test_the_harness_would_notice_a_drift(tmp_path: Path):
    """A harness nobody has watched fail is a harness nobody should trust."""

    if shutil.which("node") is None:
        pytest.skip("node is needed to run the frontend module")

    source = to_javascript(CURRENCY_TS.read_text(encoding="utf-8"))

    # Sabotage: round down instead of half up, which is exactly the kind of
    # thing that would drift by one cent and by one cent only.
    broken = source.replace(
        "return Math.floor((amount * rate + RATE_ONE / 2) / RATE_ONE);",
        "return Math.floor((amount * rate) / RATE_ONE);",
        1,
    )

    assert broken != source, "the sabotage no longer applies; check currency.ts"

    report = run(tmp_path, build_cases(), broken)

    assert report["failures"], "the rounding was dropped and nothing noticed"
