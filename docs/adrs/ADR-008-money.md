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

## Why

- Exact calculations
- No floating-point errors
- High performance
- Easy comparisons
- Common financial industry practice

## Consequences

Business logic never manipulates floating-point values.

Currency formatting is performed only when displaying values to the user.