-- A check on the expenses that somebody answered "this is right".
--
-- The panel looks over a group's expenses for what a person typing in a hurry
-- gets wrong: a figure ten times its usual, one shop written four ways, the same
-- purchase entered twice, a category it is never filed under. It works that out
-- itself, from the expenses it already holds, and nothing of it is stored --
-- except the answer "no, that one is right", which is the one thing the panel
-- cannot work out again. Without it the same alert would come back every time
-- the page was opened, which is how a check becomes a nag.
--
-- `kind` is which check (amount, names, duplicate, category) and `key` is what
-- the panel built to name the very thing answered: an expense and the figure it
-- held, the spellings of a name, two expenses, an expense and its category. A
-- change to any of those is a new thing to look at, with a new key, and the old
-- answer no longer covers it. Nothing here is money, so nothing is journalled.
CREATE TABLE check_dismissals (
    group_id TEXT NOT NULL,
    kind TEXT NOT NULL,
    key TEXT NOT NULL,

    dismissed_at TEXT NOT NULL,
    dismissed_by_member_id TEXT,

    PRIMARY KEY (group_id, kind, key),
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

UPDATE schema_version SET version = 18;
