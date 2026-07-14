-- Remember the rule that produced an expense's shares.
--
-- The shares stay the truth: the balances only ever read them. The rule is kept
-- so that reopening an expense shows what was actually meant ("10 EUR shared,
-- the rest to whoever paid") rather than the amounts it happened to resolve to.
--
-- The rule is stored with its members spelled out, never as "everyone": a
-- member joining later must not fall into an expense they had nothing to do
-- with, and re-resolving an old rule must always give back the stored shares.

ALTER TABLE expenses ADD COLUMN split_rule TEXT;

UPDATE schema_version SET version = 4;
