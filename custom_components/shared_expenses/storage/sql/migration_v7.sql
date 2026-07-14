-- An expense can be in another currency than its group.
--
-- Until now one was refused, because nothing converted and 100 USD would have
-- settled against 100 EUR. Now it converts, once, on the way in.
--
-- What the expense keeps:
--
--   amount            what was actually paid, in the cents of its own currency
--   currency          the currency it was paid in
--   converted_amount  the same, in the group's currency, at the rate below
--   exchange_rate     the rate applied, in millionths: 0.87681 is 876810
--   rate_as_of        the day the rate is from, which is not always the day of
--                     the expense: the ECB publishes nothing at the weekend
--
-- The shares stay in the group's currency and add up to `converted_amount`.
-- Converting them one by one at every read would round afresh every time, and
-- a balance that does not come back the same tomorrow is not a balance.
--
-- The rate is frozen here on purpose. What someone owes was settled on the day
-- they were owed it; a rate that moved afterwards is a fact about the market,
-- not about the debt.

ALTER TABLE expenses ADD COLUMN converted_amount INTEGER;
ALTER TABLE expenses ADD COLUMN exchange_rate INTEGER;
ALTER TABLE expenses ADD COLUMN rate_as_of TEXT;

-- Every expense so far is in its group's currency: that was enforced. So each
-- converts to itself, at a rate of one.
UPDATE expenses
SET converted_amount = amount,
    exchange_rate = 1000000
WHERE converted_amount IS NULL;

-- Every rate ever seen, from the source or typed by hand.
--
-- Kept so that a rate can be had when the source cannot be reached: the last
-- known one, with the date it is from, is worth far more than a refusal — as
-- long as it says how old it is.
CREATE TABLE exchange_rates (
    id TEXT PRIMARY KEY,

    base TEXT NOT NULL,
    quote TEXT NOT NULL,

    rate INTEGER NOT NULL,

    as_of TEXT NOT NULL,

    -- 'ecb' from the source, 'manual' when somebody typed it. A hand-typed one
    -- is a deliberate reference and outranks nothing: it is simply the last
    -- known rate for that day.
    source TEXT NOT NULL,

    created_at TEXT NOT NULL
);

-- One rate per pair per day: fetching the same day twice must not stack rows.
CREATE UNIQUE INDEX idx_rates_pair_day ON exchange_rates(base, quote, as_of);

-- The last one known for a pair, which is what a fallback asks for.
CREATE INDEX idx_rates_pair ON exchange_rates(base, quote, as_of DESC);

UPDATE schema_version SET version = 7;
