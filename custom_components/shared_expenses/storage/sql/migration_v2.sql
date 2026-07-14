-- Default split rules, stored as JSON.
--
-- A rule attached to a category applies to the expenses of that category.
-- The rule attached to a group applies to expenses without a category.

ALTER TABLE groups ADD COLUMN split_rule TEXT;

ALTER TABLE categories ADD COLUMN split_rule TEXT;

UPDATE schema_version SET version = 2;
