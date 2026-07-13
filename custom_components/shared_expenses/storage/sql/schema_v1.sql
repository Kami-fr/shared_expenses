PRAGMA foreign_keys = ON;

CREATE TABLE schema_version (
    version INTEGER NOT NULL
);

INSERT INTO schema_version (version)
VALUES (1);

CREATE TABLE groups (
    id TEXT PRIMARY KEY,

    name TEXT NOT NULL,
    description TEXT,

    currency TEXT NOT NULL,

    icon TEXT,
    color TEXT,

    archived INTEGER NOT NULL,

    created_at TEXT NOT NULL
);

CREATE TABLE members (
    id TEXT PRIMARY KEY,

    user_id TEXT,

    name TEXT NOT NULL,

    color TEXT,

    active INTEGER NOT NULL,

    created_at TEXT NOT NULL
);

CREATE TABLE group_members (
    id TEXT PRIMARY KEY,

    group_id TEXT NOT NULL,
    member_id TEXT NOT NULL,

    role TEXT NOT NULL,

    joined_at TEXT NOT NULL,
    left_at TEXT,

    created_at TEXT NOT NULL,

    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

CREATE TABLE categories (
    id TEXT PRIMARY KEY,

    group_id TEXT NOT NULL,

    name TEXT NOT NULL,

    icon TEXT,
    color TEXT,

    created_at TEXT NOT NULL,

    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

CREATE TABLE expenses (
    id TEXT PRIMARY KEY,

    group_id TEXT NOT NULL,
    category_id TEXT,

    title TEXT NOT NULL,
    description TEXT,

    amount INTEGER NOT NULL,
    currency TEXT NOT NULL,

    paid_by_member_id TEXT NOT NULL,

    expense_date TEXT NOT NULL,

    created_at TEXT NOT NULL,

    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (paid_by_member_id) REFERENCES members(id)
);

CREATE TABLE expense_shares (
    id TEXT PRIMARY KEY,

    expense_id TEXT NOT NULL,
    member_id TEXT NOT NULL,

    amount INTEGER NOT NULL,

    created_at TEXT NOT NULL,

    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id)
);

CREATE TABLE payments (
    id TEXT PRIMARY KEY,

    group_id TEXT NOT NULL,

    description TEXT,

    from_member_id TEXT NOT NULL,
    to_member_id TEXT NOT NULL,

    amount INTEGER NOT NULL,

    payment_date TEXT NOT NULL,

    created_at TEXT NOT NULL,

    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (from_member_id) REFERENCES members(id),
    FOREIGN KEY (to_member_id) REFERENCES members(id)
);

CREATE INDEX idx_group_members_group_id
    ON group_members(group_id);

CREATE INDEX idx_group_members_member_id
    ON group_members(member_id);

CREATE INDEX idx_categories_group_id
    ON categories(group_id);

CREATE INDEX idx_expenses_group_id
    ON expenses(group_id);

CREATE INDEX idx_expenses_paid_by_member_id
    ON expenses(paid_by_member_id);

CREATE INDEX idx_expense_shares_expense_id
    ON expense_shares(expense_id);

CREATE INDEX idx_expense_shares_member_id
    ON expense_shares(member_id);

CREATE INDEX idx_payments_group_id
    ON payments(group_id);

CREATE INDEX idx_payments_from_member_id
    ON payments(from_member_id);

CREATE INDEX idx_payments_to_member_id
    ON payments(to_member_id);