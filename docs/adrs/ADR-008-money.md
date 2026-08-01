# ADR-008 - Money

## Status

Accepted

## Context

Shared Expenses manages financial data.

Floating-point numbers introduce rounding errors that are unacceptable for financial calculations.

## Decision

All monetary values are stored as integer cents.

Examples:

| Displayed | Stored |
|----------:|--------:|
| €12.34 | 1234 |
| €0.01 | 1 |
| -€5.50 | -550 |

SQLite stores monetary values as `INTEGER`.

Python uses `int`.

Formatting is handled only by the frontend.

**Exchange rates follow the same rule.** A rate is not money, but a rate applied
to money is, so rates are integers too: millionths, where 0.87681 is 876810. A
rate is parsed from its typed form digit by digit and never through a float —
"0.1" is not 0.1 in binary, and a rate arriving a millionth short quietly costs
somebody a cent.

Rounding is **half up**, done in whole numbers: adding half a millionth before
the floor divide is the same as rounding, without a float ever appearing.
Python's own `round` will not do — it rounds halves to even, so 0,005 lands on
0,00 and 0,015 on 0,02. That is defensible in statistics and indefensible on a
receipt.

## Why

- Exact calculations
- No floating-point errors
- High performance
- Easy comparisons
- Common financial industry practice

## Consequences

Business logic never manipulates floating-point values.

Currency formatting is performed only when displaying values to the user.

Dividing money is never exact, so it is done explicitly: an amount split three
ways hands the leftover cents out deterministically rather than losing them,
starting on the member the amount points at rather than always on the first.
Always on the first was deterministic too, and that was the whole of what it
set out to be — but the pool arrives in the group's own order, so the same
member bore the extra cent of every uneven split the group ever made: 6,67 € of
them over a thousand expenses split three ways, against nothing at all for
another member.

The offset is the **quotient** of the division, not the amount. `amount % count`
is the count of leftover cents itself, so at two members every odd amount would
hand its cent to the second and never to the first — the same unfairness wearing
the other shoe. The quotient moves independently of the remainder and comes out
level over every amount.

It is derived from the amount alone, and it has to be: the expense has no id
while the dialog is still adding it up, and the panel must resolve exactly what
the backend will store. Same amount, same shares, so reopening an expense leaves
every share where it was. Converting a set of shares divides the converted total instead
of converting each share, for the same reason — three shares of a cent at a rate
of a third would each round to nothing, and the shares would stop adding up to
what they are shares of.

This arithmetic exists in Python and in TypeScript, and the two are checked
against each other. See ADR-012.