-- One member per Home Assistant account.
--
-- Members are global and `group_members` links them to groups, so two rows
-- carrying the same `user_id` would be the same person twice. Members without
-- an account keep `user_id` NULL, and a partial index lets any number of them
-- coexist: in SQLite, NULLs are distinct in a UNIQUE index anyway, but the
-- WHERE clause states the intent and keeps the index small.

CREATE UNIQUE INDEX idx_members_user_id
    ON members(user_id)
    WHERE user_id IS NOT NULL;

UPDATE schema_version SET version = 3;
