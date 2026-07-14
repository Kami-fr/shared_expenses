# Roadmap

## Sprint 1 — Foundations

- [x] Integration skeleton
- [x] Config flow

## Sprint 2 — Storage

- [x] SQLite
- [x] Domain models
- [x] Repositories
- [x] Versioned migrations (`schema_v2`: split rules)

## Sprint 3 — Business logic

- [x] Groups, members, categories
- [x] Expenses and shares
- [x] Payments
- [x] Split rules (fixed amounts, capped envelope, surplus to the payer)
- [x] Balances and simplified reimbursements

## Sprint 4 — API and panel

- [x] WebSocket API (27 commands)
- [x] Panel registration
- [x] Lit 3 frontend: dashboard, group detail, dialogs

## Sprint 5 — Quality

- [x] Unit tests for the helpers
- [x] Manager tests against SQLite
- [ ] WebSocket tests with `pytest-homeassistant-custom-component`
- [ ] Frontend tests

## Sprint 6 — Release

- [x] `hacs.json`
- [x] CI (ruff, pytest, hassfest, HACS, frontend build)
- [ ] README with screenshots
- [ ] Publish to HACS

## Later

- [ ] Editing and deleting expenses from the panel
- [ ] Category management in the panel
- [ ] Statistics
- [ ] Percentage and weighted splits
- [ ] Surplus to a member other than the payer
