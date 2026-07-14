-- The category a new expense starts on.
--
-- Most households spend on the same thing over and over, and picking it every
-- time is a tap that says nothing. A group can name one, and the dialog opens
-- there.
--
-- ON DELETE SET NULL, not CASCADE: deleting a category must not take the group
-- with it. The group simply stops having a default, which is where it started.

ALTER TABLE groups ADD COLUMN default_category_id TEXT
    REFERENCES categories(id) ON DELETE SET NULL;

UPDATE schema_version SET version = 6;
