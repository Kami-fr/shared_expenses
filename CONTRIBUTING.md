# Contributing to Shared Expenses

Thank you for your interest in Shared Expenses.

## Development Workflow

- Create a branch from `main`.
- Follow the coding guidelines.
- Keep commits small and focused.
- Use Conventional Commits.

## Branches

- `main` → The one permanent branch. Every commit on it passes CI; a release is a tag on it.
- Work happens on short-lived branches from `main`, merged back when green.

## Commit examples

```text
feat: add SQLite storage

fix: correct balance calculation

docs: update architecture

refactor: simplify repository
```

## Coding

Please follow the rules defined in:

- docs/coding_guidelines.md

## Architecture

Please read:

- docs/architecture.md
- docs/adr/

## Goal

Shared Expenses should look and feel like an official Home Assistant integration.