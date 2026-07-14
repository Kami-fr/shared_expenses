# ADR-010 - Domain Model First

## Status

Accepted

## Context

Shared Expenses is a business-oriented application.

The domain model represents the core of the application and should not be constrained by the storage implementation or the user interface.

## Decision

The domain model is designed before the database schema, repositories and frontend.

The development order is:

1. Domain models
2. Repositories
3. Storage
4. Frontend

The database schema reflects the domain model and never defines it.

## Why

- Clear separation of responsibilities
- Business rules remain independent of storage
- Easier to evolve the application
- Simpler testing
- Better maintainability
- Consistent architecture

## Consequences

New features start with the domain model.

Repositories adapt the domain model to the database.

The frontend displays the domain model without introducing business logic.

The database schema evolves to support the domain model.