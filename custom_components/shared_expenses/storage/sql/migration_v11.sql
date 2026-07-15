-- Two roles instead of three: a group has one admin, and everybody else.
--
-- `owner` and `admin` were nearly the same thing. An admin was above every
-- permission, exactly as an owner was, and differed only in not being able to
-- delete the group, change what it allows, or hand it on. So the middle step
-- named somebody who was almost in charge — which, for a household's shopping
-- list, is not a station worth having. The word "owner" goes; "admin" is what
-- stays, and it is handed on rather than handed out.
--
-- The order below is not a detail. A group could hold an owner AND an admin,
-- and a group must come out of this with exactly one admin, so the old admins
-- have to be demoted BEFORE the owner is promoted. Run the other way round,
-- the freshly promoted owner would be demoted with them and the group would end
-- up with nobody in charge — which nothing else in the schema would notice.
--
-- Demoting the old admins is the honest reading of what happened to that step:
-- it did not survive, so neither does the standing it gave. The owner is the
-- one who actually ran the group, and is the one who keeps running it.

UPDATE group_members SET role = 'member' WHERE role = 'admin';
UPDATE group_members SET role = 'admin' WHERE role = 'owner';

UPDATE schema_version SET version = 11;
