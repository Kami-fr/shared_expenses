# ADR-012 - Double Implementations and Parity Harnesses

## Status

Accepted

## Context

The panel has to show what an expense comes to **before** it is saved: what each
person's share is as the amount is typed, what a foreign amount converts to as
the currency is picked. Waiting for a round trip on every keystroke is not an
option, and neither is showing nothing.

That means the arithmetic has to exist in the browser. The backend cannot be
asked, and it cannot be trusted to agree by accident — it is a different
language, with different rounding, different integer division, and a different
author on a different day.

Two implementations of the same rule is a duplication, and duplication normally
drifts. Here the drift has a specific cost: the panel promises one split, the
backend stores another, and the person who typed the figures never sees the
difference. Money moves quietly.

## Decision

Some logic exists twice, deliberately:

| Python | TypeScript |
|--------|------------|
| `helpers/splits.py` | `frontend/src/services/splits.ts` |
| `helpers/currency.py` | `frontend/src/services/currency.ts` |

Each pair is held together by a **parity harness** in `tests/parity/`: generated
cases are run through both sides and the answers compared cent by cent.

A third harness guards something the panel does alone. `split-modes.ts` reads a
stored rule back into the editor's modes, and writes it out again; a mode read
wrong moves money the moment an expense is merely **opened and saved**. That one
is a round trip rather than a pair — there is nothing in Python to compare it
against — but it earns its place for the same reason: the failure is silent.

All three run under `pytest`, so a divergence fails the build like anything
else.

**Every harness has a test that sabotages one side on purpose**, and fails if
the harness still passes. A harness that cannot fail is not a harness — it is a
decoration, and a comforting one.

The duplication stops at arithmetic. Nothing else is written twice: no
validation, no persistence, no business rule that the panel does not have to
show live.

## Why

- A live preview is the whole point of the split editor. Without it the rule is
  abstract and people get it wrong.
- Generated cases find what hand-written ones do not. Round-trip bugs in the
  split modes were found at 27 rules, then 11, then 139, then 40 — every one of
  them would have shipped.
- The sabotage test exists because a harness that silently stops comparing is
  worse than no harness: it converts an unknown into a false assurance.

## Consequences

**Changing one side means changing the other, and running the harness.** This is
the cost, it is real, and it is paid on every change to a resolver. It is
cheaper than the bug it prevents.

The harnesses only prove the two agree. They do not prove either is right —
that is what the unit tests are for. A rule wrong in both languages passes
parity happily.

Neither type checking nor the build catches a divergence: both sides compile
fine while disagreeing. `Math.TAU` does not exist and every pie slice would have
been `NaN`; `tsc` had no opinion. Only running the thing finds these.

See ADR-008 for why all of it is integers, and ADR-011 for the conversion.
