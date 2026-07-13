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

---

### members

| Column | Type | Description |
|---------|------|-------------|
| id | TEXT | ULID |
| user_id | TEXT | Home Assistant user id (nullable) |
| name | TEXT | Display name |
| color | TEXT | Optional color |
| active | INTEGER | 0 = inactive, 1 = active |
| created_at | TEXT | UTC ISO-8601 timestamp |

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