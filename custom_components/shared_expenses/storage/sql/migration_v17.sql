-- An expense that comes back: the rent, a subscription, the electricity.
--
-- A recurring expense is not an expense. It is what one will look like when it
-- falls due -- who pays, what for, how it is split, roughly how much -- and a
-- rhythm: every `every` days, weeks or months from `anchor`. Nothing here is
-- money. An occurrence becomes money only when a member confirms it, and then it
-- is an ordinary row in `expenses`, which is the only table the balances read.
-- Proposed rather than added, at the user's choice: the electricity is never the
-- same twice, and a figure nobody looked at should not move anybody's balance.
--
-- The due dates are computed from the anchor and an index, never step by step.
-- Rent on the 31st falls on the 30th in November and the 28th in February; walked
-- forward one month at a time it would stay on the 28th for good, and the anchor
-- is what lets March find the 31st again. `next_index` is the occurrence waiting
-- to be confirmed or skipped, and everything before it has been one or the other.
-- An occurrence whose day has come is "to confirm" until somebody answers it,
-- however long Home Assistant was off, so missed ones are caught up at their own
-- dates without anything having to run on the day.
--
-- `amount` is what to propose, in the cents of `currency`, and only that: the one
-- confirmed may differ, and each confirmed expense keeps its own. Never negative:
-- a refund that recurs is not a thing a shop does.
--
-- `split_rule` is the rule to propose, as JSON, or NULL to leave it to the
-- category and then the group, as a new expense does -- read at confirmation, so
-- a rule changed in between is the rule applied.
--
-- `announced` is the day the last due event went out, so that an automation
-- sending a reminder sends one per occurrence and not one per restart.
CREATE TABLE recurring_expenses (
    id TEXT PRIMARY KEY,

    group_id TEXT NOT NULL,
    category_id TEXT,

    title TEXT NOT NULL,
    description TEXT,

    amount INTEGER NOT NULL,
    currency TEXT NOT NULL,

    paid_by_member_id TEXT NOT NULL,
    split_rule TEXT,

    every INTEGER NOT NULL,
    unit TEXT NOT NULL,
    anchor TEXT NOT NULL,
    next_index INTEGER NOT NULL,
    ends_on TEXT,
    paused INTEGER NOT NULL DEFAULT 0,
    announced TEXT,

    created_at TEXT NOT NULL,
    created_by_member_id TEXT,

    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (paid_by_member_id) REFERENCES members(id)
);

CREATE INDEX idx_recurring_expenses_group_id
    ON recurring_expenses(group_id);

-- The recurring expense a confirmed occurrence came from.
--
-- No foreign key, for the reason `refund_of` has none: stopping a recurring
-- expense deletes it, and what it already added is money that was spent and
-- stays spent, still saying where it came from. `ON DELETE SET NULL` would make
-- stopping the rent rewrite last month's rent; the id held plainly just points
-- at nothing afterwards, which the panel reads as "no longer repeats".
ALTER TABLE expenses ADD COLUMN recurring_id TEXT;

-- The last confirmed occurrence of one recurring expense, which is what the
-- panel shows beside the next: "164,12 last time".
CREATE INDEX idx_expenses_recurring_id
    ON expenses(recurring_id);

UPDATE schema_version SET version = 17;
