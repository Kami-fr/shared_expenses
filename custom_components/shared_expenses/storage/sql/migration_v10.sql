-- A group says what its members may do, and an entry says who wrote it.
--
-- Until now `role` was decorative: it was stored, served and settable, and not
-- one command ever read it. Being an active member of a group meant being able
-- to do everything in it — remove the others, rewrite their expenses, delete
-- the group and every expense in it. The only rule that existed was that the
-- owner could not leave, which locked them in rather than protecting anything.
--
--   allow_manage_members     add, remove and rename members
--   allow_manage_categories  the categories and their split rules
--   allow_manage_group       rename, describe, default rule, archive
--   allow_edit_others        touch an expense or a payment that is not theirs
--
-- Each says what an ORDINARY member may do: an owner and an admin are above
-- them. Deleting the group is not among them and never will be — it takes
-- every expense with it, and belongs to the owner alone.
--
-- All four default to 1, here and for every group that already exists. Nobody
-- comes back from a restart to find they cannot do what they did yesterday: a
-- household is not a company, and shutting a door is a deliberate act.

ALTER TABLE groups ADD COLUMN allow_manage_members INTEGER NOT NULL DEFAULT 1;
ALTER TABLE groups ADD COLUMN allow_manage_categories INTEGER NOT NULL DEFAULT 1;
ALTER TABLE groups ADD COLUMN allow_manage_group INTEGER NOT NULL DEFAULT 1;
ALTER TABLE groups ADD COLUMN allow_edit_others INTEGER NOT NULL DEFAULT 1;

-- Who entered the thing, which is not always who it is about. Both make it
-- yours: recording what your flatmate paid must not cost you the right to fix
-- your own typo, and only ever counting the typist would let somebody with no
-- stake in the money own the line.
--
-- Nullable, and no REFERENCES clause: SQLite only accepts a foreign key on a
-- column added after the fact when it defaults to NULL, and a default of NULL
-- is exactly what the past deserves. The member is looked up, never trusted
-- blind, everywhere it is written.

ALTER TABLE expenses ADD COLUMN created_by_member_id TEXT;
ALTER TABLE payments ADD COLUMN created_by_member_id TEXT;

-- The history knows some of it. Since v5 every creation recorded the account
-- behind it, so whoever entered an expense can be recovered where that account
-- still maps to a member. Anything older than v5 keeps NULL, honestly: nobody
-- wrote it down, and guessing the payer would invent a fact.

UPDATE expenses
SET created_by_member_id = (
        SELECT members.id
        FROM revisions
        INNER JOIN members ON members.user_id = revisions.actor_user_id
        WHERE revisions.entity_type = 'expense'
          AND revisions.entity_id = expenses.id
          AND revisions.action = 'created'
        ORDER BY revisions.at
        LIMIT 1
    )
WHERE created_by_member_id IS NULL;

UPDATE payments
SET created_by_member_id = (
        SELECT members.id
        FROM revisions
        INNER JOIN members ON members.user_id = revisions.actor_user_id
        WHERE revisions.entity_type = 'payment'
          AND revisions.entity_id = payments.id
          AND revisions.action = 'created'
        ORDER BY revisions.at
        LIMIT 1
    )
WHERE created_by_member_id IS NULL;

UPDATE schema_version SET version = 10;
