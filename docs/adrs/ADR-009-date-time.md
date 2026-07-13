# ADR-009 - Date & Time

## Status

Accepted

## Context

Shared Expenses stores creation dates, update dates and payment dates.

Users may be located in different time zones.

## Decision

All dates are stored in UTC.

Python uses timezone-aware `datetime` objects.

```python
from datetime import UTC, datetime

datetime.now(UTC)
```

SQLite stores dates as ISO 8601 strings.

The frontend is responsible for displaying dates in the user's local time zone.

## Why

- No ambiguity
- Consistent comparisons
- No daylight saving issues
- Compatible with Home Assistant
- Compatible with Python best practices

## Consequences

Naive `datetime` objects are never used.

Business logic always works with UTC timestamps.