-- A group can put itself on the dashboard, and does not by default.
--
-- Entities are not walled. Home Assistant has the machinery for it — there is
-- an entity policy per account — but nothing sets it: USER_POLICY grants
-- CAT_ENTITIES outright, there is no interface for anything else, and so every
-- account in the house reads every entity's state.
--
-- Which is the whole of why this column exists. Everything else in this
-- integration is built on a wall: `Scope` refuses a group you are not in, and
-- `list_user_groups` never lets you learn it is there. A sensor carrying a
-- balance walks straight through that. The flatmate who has nothing to do with
-- a project would read its figures off the dashboard.
--
-- So: 0. Not because closed is the safe default to reach for, but because
-- turning this on takes a wall down, and nothing that takes a wall down may
-- happen to somebody who did not ask for it. Every group that exists today
-- stays as private as it was yesterday, and the switch says plainly what it
-- does before anybody touches it.
--
-- It is written into the group's own journal, like the permissions are. Opening
-- this is exactly the kind of decision somebody asks about a month later.

ALTER TABLE groups ADD COLUMN exposed INTEGER NOT NULL DEFAULT 0;

UPDATE schema_version SET version = 12;
