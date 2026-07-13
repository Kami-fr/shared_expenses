# ADR-001 - Home Assistant Version

## Status

Accepted

## Context

Shared Expenses is a modern Home Assistant integration.

Supporting multiple Home Assistant versions increases maintenance complexity and limits the use of new APIs.

## Decision

Shared Expenses supports only the latest stable version of Home Assistant.

## Consequences

### Advantages

- Cleaner code
- No compatibility layer
- Immediate access to the latest Home Assistant APIs
- Easier maintenance

### Drawbacks

Users running older Home Assistant versions must install an older compatible release of Shared Expenses.