# Roadmap

## Sprint 1 — Foundations

- [x] Integration skeleton
- [x] Config flow

## Sprint 2 — Storage

- [x] SQLite
- [x] Domain models
- [x] Repositories
- [x] Versioned migrations (up to `schema_v5`: history)

## Sprint 3 — Business logic

- [x] Groups, members, categories
- [x] Expenses and shares
- [x] Payments
- [x] Split rules (fixed amounts, capped envelope, surplus to the payer)
- [x] Balances and simplified reimbursements

## Sprint 4 — API and panel

- [x] WebSocket API (30 commands)
- [x] Panel registration
- [x] Lit 3 frontend: dashboard, group detail, dialogs
- [x] Category management and split rule editor in the panel

## Sprint 5 — Quality

- [x] Unit tests for the helpers
- [x] Manager tests against SQLite
- [x] Panel tests binding the real Home Assistant signatures
- [ ] WebSocket tests

  `pytest-homeassistant-custom-component` cannot be installed on Windows:
  it pulls in `homeassistant.runner`, which imports the Unix-only `fcntl`,
  and its pytest11 entry point then breaks collection of every test. Needs a
  Linux environment, or CI only.

- [ ] Frontend tests

## Sprint 6 — Release

- [x] `hacs.json`
- [x] CI (ruff, pytest, hassfest, HACS, frontend build)
- [x] README
- [ ] Screenshots
- [ ] Publish to HACS

## Sprint 7 — Accountability

- [x] History of every change to an expense or a reimbursement
- [x] Group journal, holding what deletions took away

## Later

- [ ] Statistics
- [ ] Percentage and weighted splits
- [ ] Surplus to a member other than the payer
