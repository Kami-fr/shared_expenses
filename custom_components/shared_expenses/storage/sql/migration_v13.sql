-- A member can wear their Home Assistant photo instead of coloured initials.
--
-- The choice sits on the member, not on the viewer: one setting, seen the same
-- by everybody, exactly as the colour already is. It is only ever meaningful
-- for an account — a guest has no photo to borrow — and where the person set no
-- picture the panel quietly shows the initials again. So it stays off for
-- everyone who exists today, and nobody's face appears anywhere until they ask.

ALTER TABLE members ADD COLUMN use_ha_avatar INTEGER NOT NULL DEFAULT 0;

UPDATE schema_version SET version = 13;
