-- A payment can be in another currency than its group, as an expense can.
--
-- Somebody pays a dinner bill back in dollars, or writes down a debt in the
-- money it was lent in. Until now the amount was taken to be the group's
-- currency and nothing said so, which held only because nothing else was
-- offered.
--
-- The same four columns an expense carries, and for the same reasons:
--
--   currency          what it was actually handed over in
--   converted_amount  the same money, in the group's currency, at the rate
--   exchange_rate     the rate applied, in millionths: 0.87681 is 876810
--   rate_as_of        the day the rate is from, which is not always the day of
--                     the payment: nothing is published at the weekend
--
-- `converted_amount` is what the balances count. `amount` is what was handed
-- over and is only ever shown. The rate is frozen here on purpose: what someone
-- owed was settled on the day they owed it.

ALTER TABLE payments ADD COLUMN currency TEXT;
ALTER TABLE payments ADD COLUMN converted_amount INTEGER;
ALTER TABLE payments ADD COLUMN exchange_rate INTEGER;
ALTER TABLE payments ADD COLUMN rate_as_of TEXT;

-- Every payment so far is in its group's currency: there was no way to say
-- otherwise. So each converts to itself, at a rate of one, and takes the
-- currency of the group it belongs to.
UPDATE payments
SET currency = (
        SELECT groups.currency FROM groups WHERE groups.id = payments.group_id
    ),
    converted_amount = amount,
    exchange_rate = 1000000
WHERE currency IS NULL;

UPDATE schema_version SET version = 9;
