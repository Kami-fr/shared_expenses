# Shared Expenses - Database

## Overview

The database follows the domain model.

```
Group
│
├── GroupMember
│      │
│      └── Member
│
├── Expense
│      │
│      └── ExpenseShare
│
├── Payment
│
├── Category
│
└── Revision

ExchangeRate          stands apart: a fact about the market, not about a group
```

---

## Tables

### groups

| Column | Type | Description |
|---------|------|-------------|
| id | TEXT | ULID |
| name | TEXT | Group name |
| description | TEXT | Optional description |
| currency | TEXT | ISO 4217 currency code |
| icon | TEXT | Material Design icon |
| color | TEXT | Hex color |
| archived | INTEGER | 0 = active, 1 = archived |
| exposed | INTEGER | 0 or 1, default 0 |
| created_at | TEXT | UTC ISO-8601 timestamp |
| split_rule | TEXT | Default split rule as JSON (nullable) |
| default_category_id | TEXT | FK → categories.id, the category a new expense opens on (nullable) |
| allow_manage_members | INTEGER | 0 or 1, default 1 |
| allow_manage_categories | INTEGER | 0 or 1, default 1 |
| allow_manage_group | INTEGER | 0 or 1, default 1 |
| allow_edit_others | INTEGER | 0 or 1, default 1 |

`currency` is what the group counts in. Balances, shares and statistics are all
in it; an expense paid in anything else is converted on the way in.

`default_category_id` is `ON DELETE SET NULL`, not `CASCADE`: deleting a
category must not take the group with it.

The four `allow_` columns say what an **ordinary** member may do here. The admin
is above all of them — that is what `group_members.role` is for, and it is why
one setting per group is enough instead of a matrix per person.
They map onto `Permission` in the model, which the domain sees as a set; the
mapping lives in one dict in `group_repository.py`.

One column apiece rather than a list in a blob, because this file is where the
shape of the integration is written down and a permission nobody can see by
reading it is one nobody will remember to check. Every one defaults to 1: a
group that existed before them keeps everything its members could already do.

Deleting a group is not among them and never will be: it takes every expense
with it, and it belongs to the admin alone.

`exposed` is not a permission and does not sit with them, although the admin
alone sets it too. The permissions say what people *in* the group may do;
this says whether the group's figures leave it at all. Home Assistant does not
wall entities off — the machinery is there, an entity policy per account, but
nothing sets it and `USER_POLICY` grants `CAT_ENTITIES` outright — so every
account in the house reads every entity's state whatever this integration says
about who is in which group. Hence 0: a switch that takes a wall down must be
thrown, never inherited. It is written into the group's journal like the
permissions are.

---

### members

| Column | Type | Description |
|---------|------|-------------|
| id | TEXT | ULID |
| user_id | TEXT | Home Assistant user id (nullable) |
| name | TEXT | Display name |
| color | TEXT | Optional color |
| created_at | TEXT | UTC ISO-8601 timestamp |

A member is never deactivated: leaving a group sets `group_members.left_at`,
so past expenses stay attributable.

---

### group_members

| Column | Type | Description |
|---------|------|-------------|
| id | TEXT | ULID |
| group_id | TEXT | FK → groups.id |
| member_id | TEXT | FK → members.id |
| role | TEXT | `admin` or `member` |
| joined_at | TEXT | UTC ISO-8601 timestamp |
| left_at | TEXT | UTC ISO-8601 timestamp (nullable) |
| created_at | TEXT | UTC ISO-8601 timestamp |

A group has exactly **one** admin, and nothing in the schema enforces it: the
only thing that writes a role other than `member` is `transfer_admin`, which
moves it inside one transaction. No command anywhere takes a role as an input —
that is what makes the rest of the permission model hold, and it is checked in
`tests/test_permissions.py` rather than by a constraint.

There used to be an `owner` above the admin. v11 removed it — see ADR-013.

---

### categories

| Column | Type | Description |
|---------|------|-------------|
| id | TEXT | ULID |
| group_id | TEXT | FK → groups.id |
| name | TEXT | Category name |
| icon | TEXT | Material Design icon |
| color | TEXT | Hex color |
| created_at | TEXT | UTC ISO-8601 timestamp |
| split_rule | TEXT | Default split rule as JSON (nullable) |

---

### expenses

| Column | Type | Description |
|---------|------|-------------|
| id | TEXT | ULID |
| group_id | TEXT | FK → groups.id |
| category_id | TEXT | FK → categories.id (nullable) |
| title | TEXT | Expense title |
| description | TEXT | Optional description |
| amount | INTEGER | What was paid, in the cents of `currency` |
| currency | TEXT | ISO 4217 code of what it was paid in |
| paid_by_member_id | TEXT | FK → members.id |
| expense_date | TEXT | UTC ISO-8601 timestamp |
| created_at | TEXT | UTC ISO-8601 timestamp |
| split_rule | TEXT | The rule that produced the shares, as JSON (nullable) |
| converted_amount | INTEGER | The same money, in the cents of the **group's** currency |
| exchange_rate | INTEGER | The rate applied, in millionths: 0.87681 is 876810 |
| rate_as_of | TEXT | The day the rate is from, ISO-8601 date (nullable) |
| created_by_member_id | TEXT | Who entered it, → members.id (nullable) |

`created_by_member_id` is who typed it in, which is not always who paid it, and
it is read by exactly one thing: whether this is theirs to edit without the
group's leave. Theirs means either — the payer or the typist. Counting only the
payer would leave you unable to fix your own typo on what your flatmate paid;
counting only the typist would hand the line to somebody with no stake in the
money.

It is never a foreign key and never updated: SQLite only accepts a `REFERENCES`
on a column added after the fact when it defaults to NULL, and who entered a
thing is not a thing that changes. Null means nobody knows — an expense older
than the column, or older than the history it was recovered from.

`amount` is what was handed over at the till and is only ever shown.
`converted_amount` is what it cost the group, and it is what the balances and
the statistics count. The two are equal, at a rate of one, whenever the expense
is in the group's own currency — the overwhelming case.

`rate_as_of` is not always the expense's own day: the source publishes nothing
at the weekend, so a Sunday is served Friday's rate. The day given is stored,
never the day asked for.

The rate is frozen here on purpose. What someone owes was settled on the day
they were owed it; a rate that moved afterwards is a fact about the market, not
about the debt.

---

### expense_shares

| Column | Type | Description |
|---------|------|-------------|
| id | TEXT | ULID |
| expense_id | TEXT | FK → expenses.id |
| member_id | TEXT | FK → members.id |
| amount | INTEGER | Amount in cents of the **group's** currency |
| created_at | TEXT | UTC ISO-8601 timestamp |

Shares are in the group's currency and always add up to
`expenses.converted_amount`, never to `expenses.amount`. A split is settled in
what the expense was paid in — the editor sits under that amount, so "Antonin
owes 20" on a New York dinner is twenty dollars — and the shares are converted
before being stored.

The converted total is divided rather than each share converted on its own:
three shares of a cent at a rate of a third would each round down to nothing,
and the shares would stop adding up to what they are shares of. Converting at
every read would round afresh every time, and a balance that does not come back
the same tomorrow is not a balance.

---

### payments

| Column | Type | Description |
|---------|------|-------------|
| id | TEXT | ULID |
| group_id | TEXT | FK → groups.id |
| description | TEXT | Optional description |
| from_member_id | TEXT | FK → members.id |
| to_member_id | TEXT | FK → members.id |
| amount | INTEGER | What moved, in the cents of `currency` |
| currency | TEXT | ISO 4217 code of what it was handed over in |
| payment_date | TEXT | UTC ISO-8601 timestamp |
| created_at | TEXT | UTC ISO-8601 timestamp |
| kind | TEXT | `reimbursement` or `debt` |
| converted_amount | INTEGER | The same money, in the cents of the **group's** currency |
| exchange_rate | INTEGER | The rate applied, in millionths |
| rate_as_of | TEXT | The day the rate is from, ISO-8601 date (nullable) |
| created_by_member_id | TEXT | Who wrote it down, → members.id (nullable) |

`created_by_member_id` works exactly as an expense's. A payment is theirs if
they wrote it down **or** if it is about them — either party. A debt you owe is
as much yours to correct as the lender's.

`from_member_id` is whoever is out of pocket, whichever kind it is: on a
reimbursement they settled up, on a debt they lent. That is why the balances
need no help telling the two apart — they are the same movement of money, and
`from` becomes the creditor either way.

The four currency columns work exactly as an expense's, and for the same reason:
`converted_amount` is what the balances count, because 100 USD handed back does
not clear 100 EUR owed. The rate is frozen here too — what someone owed was
settled on the day they owed it.

`kind` exists to be read, never to be counted: no balance, no statistic and no
settlement looks at it. "Michel owes 46,25 to Dupont" shown as a transfer read
as "Dupont paid Michel" — true of a loan, and nonsense for a debt somebody is
only writing down. The word was the whole of what was missing.

---

### revisions

| Column | Type | Description |
|---------|------|-------------|
| id | TEXT | ULID |
| group_id | TEXT | FK → groups.id |
| entity_type | TEXT | `expense`, `payment`, `group`, `category`, `member` |
| entity_id | TEXT | The expense or payment, **not** a foreign key |
| entity_label | TEXT | What it was called, for the group journal (nullable) |
| action | TEXT | `created`, `updated`, `deleted`, `restored` |
| actor_user_id | TEXT | The Home Assistant account behind the change (nullable) |
| changes | TEXT | The fields that moved, as JSON |
| at | TEXT | UTC ISO-8601 timestamp |

`entity_id` is deliberately not a foreign key: the point of a history is to
outlive what it describes, and a deletion must leave its own record behind.
`entity_label` is stored for the same reason — a deleted expense can no longer
be asked its title.

Ids inside `changes` are resolved when read, not when written, so a member who
is renamed reads back under the name they go by now.

**The journal holds more than the money.** The group itself — its name, its
default rule, what it allows — its categories, and its people: who joined, who
left, who was renamed, and who runs it. Those are the changes that decide who
may touch an expense at all, and they used to happen with no record: the one
worth explaining afterwards was the one nothing wrote down. Neither the new
entity types nor the `restored` action needed a migration; `entity_type` and
`action` are plain TEXT with no constraint on them.

A member's revision belongs to the group that asked for it. A member is global —
one per Home Assistant account, across every group — so a rename is felt
everywhere, and there is no one group it is *of*. The one whose journal shows it
is the one where it was decided; the others were not party to it.

A save that moved no field records nothing. A journal full of nothing is a
journal nobody reads.

**A deletion carries a snapshot, not a diff.** Every field, including the four
an expense's history never shows — `converted_amount`, `exchange_rate`,
`rate_as_of`, `split_rule` — plus `created_by_member_id`. This row is the only
place the expense still exists, and it is what `restore_expense` builds it back
from. The rate above all: what somebody owed was settled on the day they owed
it, and converting afresh on a restore would quietly bring back a different
debt.

A restore re-inserts the expense **with the id it always had**, so its history
runs on unbroken — created, updated, deleted, restored, one line — and every
link the journal holds to it works again. No new action needed a migration:
`action` is plain TEXT with no constraint on it.

The panel spells out the fields of an `updated` and of nothing else. A creation
lists what it was born with, a deletion takes every field there is, and a
restore is a deletion read backwards: naming them says only what the verb
already said. The snapshot is data, not display.

Deletions written before this carry only the eight fields the history showed.
They still restore: the money is worked out again for the thing's own day, and
the rate of a day gone by does not move.

---

### exchange_rates

| Column | Type | Description |
|---------|------|-------------|
| id | TEXT | ULID |
| base | TEXT | ISO 4217 code converted from |
| quote | TEXT | ISO 4217 code converted to |
| rate | INTEGER | In millionths: 0.87681 is 876810 |
| as_of | TEXT | The day the rate is from, ISO-8601 date |
| source | TEXT | `ecb` from the service, `manual` when somebody typed it |
| created_at | TEXT | UTC ISO-8601 timestamp |

Indexes: `idx_rates_pair_day` is unique on `(base, quote, as_of)`, so fetching
the same day twice cannot stack rows; `idx_rates_pair` on
`(base, quote, as_of DESC)` answers "the last rate known for this pair", which
is what a fallback asks for.

Every rate ever seen is kept so that one can be had when the service cannot be
reached. A hand-typed rate outranks nothing: it is simply the last known rate
for that day. What matters is that whatever is offered always says how old it
is — a stale rate presented as today's is worse than no rate.

This table belongs to no group. A rate is a fact about the market.

---

### schema_version

A single row holding a single integer. See **Migrations** below.

---

## Conventions

### Identifiers

- ULID
- SQLite type: `TEXT`

### Money

- Stored in cents
- SQLite type: `INTEGER`

Never a float, at any point. A rate is not money, but a rate applied to money
is, so rates are integers too: millionths, in `INTEGER`. Rounding is half up and
done in whole numbers — Python's own `round` rounds halves to even, which is
defensible in statistics and indefensible on a receipt.

### Dates

- UTC
- ISO-8601
- SQLite type: `TEXT`

### Foreign keys

SQLite foreign keys are always enabled.

### Transactions

`Database.transaction()` is the only place issuing `BEGIN` and `COMMIT`. The
connection runs with `isolation_level=None`, so a repository statement outside a
transaction commits on its own instead of sitting in an implicit transaction that
nothing would ever commit.

**One connection carries one transaction, so one writer at a time.** A lock is
held for the length of the outermost transaction, and the task holding it is
remembered so a nested `transaction()` joins rather than waiting on itself. This
was a depth counter shared by every coroutine, and the counter went up only
after the `BEGIN` had been awaited: two writers starting together both believed
they were first, one of their `BEGIN`s failed, and whichever left last committed
the other's unfinished work or rolled it back from under them. Both were silent.

**What a write promises is said after it lands.** `Database.after_commit()`
holds a callback until the outermost transaction has committed, and drops it
when there was no commit. That is how `_announce` reaches the coordinator, the
dashboard card and the bus: everything that hears a change comes back to this
connection to read, and a listener told before the COMMIT reads a write that has
not happened.

**Known and left alone:** reads do not take the lock. They share the connection,
so a read landing in the middle of somebody's write sees uncommitted rows for a
few milliseconds. Nothing acts on that any more — the announcement waits, so
nobody is sent to look at the wrong moment — and closing it properly would mean
a second connection for reading. Not worth it yet.

---

## Split rules

`groups.split_rule`, `categories.split_rule` and `expenses.split_rule` all hold
a rule in the same JSON shape. A rule has two steps, and both share equally by
default.

```json
{
  "envelope": 1000,
  "participants": ["<member_id>", "..."],
  "remainder": {
    "members": ["<member_id>", "..."],
    "fixed": { "<member_id>": 1200 },
    "percent": { "<member_id>": 6000 }
  }
}
```

| Field | Meaning |
|-------|---------|
| `envelope` | Amount in cents shared equally between `participants`. `null` means the whole expense, which is the plain equal split. |
| `participants` | Members sharing the envelope. `null` means every active member. |
| `remainder.members` | Members taking what the envelope left. `null` means the payer alone. |
| `remainder.fixed` | Amounts in cents owed by named members out of the remainder. |
| `remainder.percent` | Shares of the remainder, in hundredths of a percent: 60% is 6000, a third is 3333. |

Resolution order: `envelope` is split equally between `participants`, then
`total − envelope` goes to the remainder. Within the remainder, a member owes
the amount or the share written against them, and a member with neither takes an
equal part of what the others left. A member cannot owe both an amount and a
share.

Percentages are of the remainder itself, not of what the fixed amounts happen to
leave behind: "60%" is 60% of the same thing whether or not somebody else owes a
flat 10.

Example — an expense of 85,42 € paid by Stéphane, shared with Antonin, with
`envelope = 1000` and a remainder left to the payer: the envelope splits
500/500, and the remaining 7542 goes to Stéphane. Final shares: Stéphane 8042,
Antonin 500.

Rules are stored with their members spelled out, never as "everyone" — a `null`
is resolved to the actual members before being written. Someone joining next
month never falls into an expense they had nothing to do with, and re-resolving
an old rule gives back the shares that were stored.

A rule on an expense is what produced that expense's shares, frozen. A rule on a
category or a group only ever pre-fills the dialog; nothing re-reads it later,
and changing it never moves an expense that has already been saved.

The rule is only a template for the dialog: shares are always stored resolved in
`expense_shares`, and the balances never read the rule back.

The resolver exists twice — `helpers/splits.py` and
`frontend/src/services/splits.ts` — so the panel can show what a rule comes to
before it is saved. The two are checked against each other on generated cases:
**changing one means running the parity harness.**

---

## Migrations

The `schema_version` table holds a single integer. `storage/migrations.py`
creates `schema_v1.sql` on an empty database, then applies `migration_v<n>.sql`
one by one up to `DATABASE_VERSION`. Each migration file bumps the version
itself. Downgrades are refused.

**Current version: 12.**

| Version | What it added |
|---------|---------------|
| 1 | The schema: groups, members, group_members, categories, expenses, expense_shares, payments |
| 2 | `split_rule` on groups and categories |
| 3 | `idx_members_user_id`: one member per Home Assistant account |
| 4 | `expenses.split_rule`: the rule that produced an expense's shares |
| 5 | `revisions`: the history of every change |
| 6 | `groups.default_category_id`: the category a new expense opens on |
| 7 | `expenses.converted_amount`, `exchange_rate`, `rate_as_of`, and the `exchange_rates` table |
| 8 | `payments.kind`: a debt, said as one |
| 9 | `payments.currency`, `converted_amount`, `exchange_rate`, `rate_as_of` |
| 10 | The four `groups.allow_` columns, and `created_by_member_id` on expenses and payments |
| 11 | Two roles instead of three: `owner` goes, `admin` stays |
| 12 | `groups.exposed`: whether a project puts its figures on the dashboard |

Migrations are additive. Every existing row must come out of one meaning what it
meant going in — v7 converts every past expense to itself at a rate of one,
because a group's own currency was all that was allowed before it; v8 defaults
every past payment to `reimbursement`, because that is all there was; v9 gives
every past payment the currency of the group it belongs to, read from `groups`
rather than assumed, because a group counting in francs never held euros; v10
grants every existing group all four permissions, because that is exactly what
its members could do the day before, and recovers `created_by_member_id` from
the `created` revision where one exists — anything older keeps NULL, since
nobody wrote it down and guessing the payer would invent a fact.

v11 is the one whose **order** is the whole migration. A group could hold an
owner *and* an admin, and must come out with exactly one admin, so the old
admins are demoted before the owner is promoted. Written the other way round,
the freshly promoted owner is demoted along with them and every group ends up
with nobody in charge — which no constraint would catch, because there is none.

The migration files carry the reasoning. They are the only place a decision
about the schema is written down at the moment it is taken, so they are worth
reading before changing anything here.