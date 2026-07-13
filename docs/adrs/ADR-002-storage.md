# ADR-002 - Storage

## Status

Accepted

## Context

Shared Expenses needs persistent local storage for groups, expenses, settlements and statistics.

Several options were considered:

- Home Assistant Storage
- SQLite
- External database

## Decision

SQLite is the only storage backend.

## Why

- Fast
- Reliable
- Lightweight
- No external dependency
- Excellent SQL support
- Easy backup
- Easy migration

## Consequences

The storage layer is isolated from the rest of the application.

The application communicates only with repositories. Repositories communicate with the storage layer.