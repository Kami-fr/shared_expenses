-- Keep what happened to the money, and who did it.
--
-- Shared money is only trusted if a figure that moved can be accounted for. An
-- expense carries no trace of having been 85,42 EUR yesterday, so a member
-- finding a balance they do not recognise has nothing to look at.
--
-- Deliberately no foreign key to expenses or payments: a deletion is exactly
-- the change worth explaining, and a cascade would erase the record of it along
-- with the row. The entity is named, not referenced, and `entity_label` freezes
-- what it was called at the time so a deleted expense can still be spoken of.
-- The group does cascade: nothing about a deleted group is worth keeping.
--
-- `changes` holds a JSON list of {field, before, after}, the values as stored
-- (cents, ids, ISO dates). Rendering them is the panel's job — it has the
-- members and categories to put names on ids, which this table would only
-- duplicate and let drift.

CREATE TABLE revisions (
    id TEXT PRIMARY KEY,

    group_id TEXT NOT NULL,

    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    entity_label TEXT,

    action TEXT NOT NULL,

    -- The Home Assistant account behind the change. Null when it was made
    -- without one: a script, or a version that did not record it yet.
    actor_user_id TEXT,

    changes TEXT NOT NULL,

    at TEXT NOT NULL,

    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- The group journal: everything that happened, newest first.
CREATE INDEX idx_revisions_group ON revisions(group_id, at DESC);

-- The history of one expense or payment.
CREATE INDEX idx_revisions_entity ON revisions(entity_id, at DESC);

UPDATE schema_version SET version = 5;
