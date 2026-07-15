# Roadmap

## Sprint 1 — Foundations

- [x] Integration skeleton
- [x] Config flow

## Sprint 2 — Storage

- [x] SQLite
- [x] Domain models
- [x] Repositories
- [x] Versioned migrations (up to `schema_v8`: the kind of a payment)

## Sprint 3 — Business logic

- [x] Groups, members, categories
- [x] Expenses and shares
- [x] Payments
- [x] Split rules: an envelope shared equally, then the rest by exact amounts or percentages
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
- [x] WebSocket tests

  Done **without** `pytest-homeassistant-custom-component`, which cannot be
  installed on Windows: it pulls in `homeassistant.runner`, which imports the
  Unix-only `fcntl`, and its pytest11 entry point then breaks collection of
  every test. The tests drive the real handlers, decorators and voluptuous
  schemas directly instead. What they lose is the transport; what they keep is
  everything this integration actually wrote — which is where the bugs were.

- [x] Parity harnesses: the split resolver and the currency conversion, each
      existing twice and checked against the other on generated cases. Each
      harness has a test that sabotages one side, to prove it can still fail.

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

## Sprint 8 — Statistics

- [x] Totals, by category and by month, and what of it was yours
- [x] Pie and bar charts, drawn as SVG by hand: the Home Assistant CSP blocks
      every external script, so a charting library was never on the table
- [x] Reimbursements left out throughout — moving money between members is not
      spending

## Sprint 9 — Currencies

- [x] An expense in another currency, converted once on the way in
- [x] A reimbursement or a debt in another currency too: 100 USD handed back
      does not clear 100 EUR owed
- [x] Rates from [Frankfurter](https://frankfurter.dev), free and needing no key
- [x] The rate frozen on what it converted, and always overridable by hand
- [x] A debt written down as one, next to reimbursements

## Sprint 10 — Repairs

Everything here was found by using the thing, which is the point.

- [x] A second group could not be created at all: the owner was minted a fresh
      member each time, against an index saying one member per account. Every
      test missed it by leaving the owner accountless — a null user_id collides
      with nothing.
- [x] Editing an expense dropped its currency: the update hand-listed eight of
      the ten fields the create sends, and `Partial` makes a missing field mean
      "leave it alone". Both dialogs now derive the update from the create.
- [x] A debt could not become a reimbursement: `update_payment` asks
      `payment_state` what moved and skips the write when the answer is nothing.
      The kind was not in it — and being the one editable field that moves no
      money, it was the one field nothing else could betray.
- [x] A group's currency was free text: "EURO" went in happily and left every
      foreign expense unsaveable, with no way back. Picked from a list now.
- [x] Groups can be renamed
- [x] The search box stopped hiding itself on short lists: a control that comes
      and goes is read as a bug

## Sprint 11 — Who may do what

`role` had been stored, served and settable since v1, and read by nothing. Any
member could delete the whole group.

- [x] Four permissions per project, all granted by default: managing members,
      managing categories, editing the project, touching what is not theirs.
      Per project and not per person — the per-person dimension is `role`, and
      it already existed.
- [x] The role means something at last: the admin is above every switch, and
      deleting the project is theirs alone.
- [x] Two roles instead of three (v11): `owner` goes, `admin` stays and is
      handed on. The middle step named somebody almost in charge of a shopping
      list, which is not a station worth having.
- [x] The admin can hand the project on, becoming an ordinary member, and only
      then leave. Being locked into your own group for life was not a rule
      protecting anything, it was the absence of this.
- [x] No command anywhere takes a role: the schema does not know the word, so a
      member who might have brought in a second account of their own as an admin
      is refused at the door rather than by a check somebody could forget.
- [x] `created_by_member_id` (v10): an entry is yours if you entered it or it is
      about you. Recovered for the past from the creation revision.
- [x] `update_member` requires its group: a guard skippable by leaving a field
      out is not a guard.
- [x] 33 tests, each guard sabotaged to prove the suite fails when it should.
      The tests that came before walk through every line of this without ever
      waking it: everything is granted by default, so only a refusal reaches it.
      See ADR-013.

## Sprint 12 — Undo

- [x] A deleted expense or payment can be brought back from the group journal,
      as the one it was: same id, so its history runs on unbroken, and same
      frozen rate — converting afresh would restore a different debt from the
      one that was deleted.
- [x] A deletion carries a snapshot rather than a diff. It is the only place the
      thing still exists, and what a restore is built from.
- [x] The panel spells out the fields of an `updated` and of nothing else. A
      deletion takes every field there is, so naming them says only what
      "deleted" already said.
- [x] "It cannot be brought back" left the delete confirmation, being no longer
      true.
- [x] 14 tests, the frozen rate sabotaged to prove they catch a re-conversion.

## Sprint 13 — The journal holds more than the money

- [x] The project itself, its categories and its people are accounted for: what
      it allows, its name and default rule, who joined, who left, who was
      renamed, and who runs it. Those decide who may touch an expense at all,
      and they used to happen with no record.
- [x] A member's revision belongs to the project that asked for it. A member is
      global, so a rename is felt everywhere; the others were not party to it.
- [x] Handing the project on writes two lines. The one giving it up is not a
      footnote to the one taking it.
- [x] A save that moved no field records nothing.
- [x] Restore is offered on an expense and a payment only — a member who left is
      not in `openable` either, and would have looked restorable on that alone.
- [x] 10 tests, the group's recording sabotaged to prove they catch its absence.

## Later

- [ ] Weighted splits (by shares, rather than by amount or percentage)
- [ ] Frontend tests. Every bug above that reached a user lived in the panel,
      where neither `tsc` nor the build nor the Python suite can see. Layout,
      at least, is measurable: Chrome headless against the built bundle catches
      what the eye does not — that is how the balance card was found spilling
      its figures on a phone.
- [ ] Refuse a group's currency changing once it holds anything. Nothing
      converts, so the same figures would simply be read in another currency —
      silently. The command allows it; only the panel not offering it stands in
      the way.
