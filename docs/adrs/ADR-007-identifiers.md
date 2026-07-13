# ADR-007 - Identifiers

## Status

Accepted

## Context

All business entities require unique identifiers that are independent of the database implementation.

The identifiers must remain unique across imports, exports, backups and future synchronization scenarios.

## Decision

All business entities use ULIDs as their primary identifier.

ULIDs are stored as `TEXT` in SQLite.

## Why

- Chronologically sortable
- Globally unique
- Better index locality than UUID v4
- Human-readable
- Easy to use in Python, SQLite, JSON and TypeScript
- Independent from the database

## Consequences

Identifiers are immutable.

Every business entity uses a ULID.

Examples:

- Group
- Member
- Expense
- ExpenseShare
- Settlement
- Category
- Attachment