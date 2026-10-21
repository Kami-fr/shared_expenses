# ADR-017 - One branch

## Status

Accepted

Supersedes ADR-004.

## Context

ADR-004 kept two permanent branches: `develop` for daily work, `main` for
releases. That made sense while the project was taking shape and a release was
an event. Three months after 1.0.0 the shape is settled, there is one
contributor, and the two branches had become a ritual: every change was made on
`develop`, opened as a pull request, squash-merged into `main`, and from then on
the two histories disagreed about a commit whose content was identical. Nothing
was ever held back on `develop` waiting for a release; `main` moved whenever
`develop` did.

The safety the second branch was meant to give already comes from elsewhere.
CI runs on every push and must be green before a tag is laid, the bundle is
versioned and checked against a fresh build, and a release is a GitHub Release
on an annotated tag, which HACS reads — not a branch.

## Decision

`main` is the one permanent branch. `develop` is deleted.

- Every commit on `main` passes CI. Work that spans several commits goes on a
  short-lived branch from `main` and is merged back when green.
- A release is an annotated tag on `main` and a GitHub Release on that tag.
  The tag is laid only once CI is green on the commit it points at.
- CI watches `main` alone, on push and on pull request.

## Consequences

- One history, no squash divergence, nothing to merge back.
- A broken commit on `main` is visible to anybody who installs from the tree
  at that moment — but HACS installs from Releases, so it reaches nobody who
  did not go looking for it. CI green before the tag is the rule that matters.
- CONTRIBUTING.md and the coding guidelines say `main` where they said
  `develop`.
