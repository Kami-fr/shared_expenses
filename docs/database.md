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
└── Category
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
| created_at | TEXT | UTC ISO-8601 timestamp |
| split_rule | TEXT | Default split rule as JSON (nullable) |

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
| role | TEXT | owner, admin, member |
| joined_at | TEXT | UTC ISO-8601 timestamp |
| left_at | TEXT | UTC ISO-8601 timestamp (nullable) |
| created_at | TEXT | UTC ISO-8601 timestamp |

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
| amount | INTEGER | Amount in cents |
| currency | TEXT | ISO 4217 currency code |
| paid_by_member_id | TEXT | FK → members.id |
| expense_date | TEXT | UTC ISO-8601 timestamp |
| created_at | TEXT | UTC ISO-8601 timestamp |

---

### expense_shares

| Column | Type | Description |
|---------|------|-------------|
| id | TEXT | ULID |
| expense_id | TEXT | FK → expenses.id |
| member_id | TEXT | FK → members.id |
| amount | INTEGER | Amount in cents |
| created_at | TEXT | UTC ISO-8601 timestamp |

---

### payments

| Column | Type | Description |
|---------|------|-------------|
| id | TEXT | ULID |
| group_id | TEXT | FK → groups.id |
| description | TEXT | Optional description |
| from_member_id | TEXT | FK → members.id |
| to_member_id | TEXT | FK → members.id |
| amount | INTEGER | Amount in cents |
| payment_date | TEXT | UTC ISO-8601 timestamp |
| created_at | TEXT | UTC ISO-8601 timestamp |

---

## Conventions

### Identifiers

- ULID
- SQLite type: `TEXT`

### Money

- Stored in cents
- SQLite type: `INTEGER`

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

---

## Split rules

`groups.split_rule` and `categories.split_rule` hold a JSON rule describing how
an expense is shared. A rule on a category wins over the rule of the group; an
expense without any applicable rule is split equally.

```json
{
  "participants": ["<member_id>", "..."],
  "fixed": { "<member_id>": 500 },
  "cap": 1000,
  "remainder": "payer"
}
```

| Field | Meaning |
|-------|---------|
| `participants` | Members sharing the envelope. `null` means every active member. |
| `fixed` | Amounts in cents assigned before any distribution. |
| `cap` | Upper bound in cents of the **whole** shared envelope, not of each share. `null` means no cap. |
| `remainder` | Who gets the surplus left above the cap. Only `payer` today. |

Resolution order: the fixed amounts are taken first, what remains is capped at
`cap` and split between `participants`, and the surplus goes to `remainder`.

Example — an expense of 85,42 € paid by Stéphane, shared with Antonin, with
`cap = 1000` and `remainder = "payer"`: the envelope is min(8542, 1000) = 1000,
split 500/500, and the remaining 7542 goes to Stéphane. Final shares: Stéphane
8042, Antonin 500.

The rule is only a template for the dialog: shares are always stored resolved in
`expense_shares`, and the balances never read the rule back.

---

## Migrations

The `schema_version` table holds a single integer. `storage/migrations.py`
creates `schema_v1.sql` on an empty database, then applies `migration_v<n>.sql`
one by one up to `DATABASE_VERSION`. Each migration file bumps the version
itself. Downgrades are refused.