-- A refund can name the expense it gives money back on.
--
-- And it takes back what v14 added. That column went onto `payments`, on a
-- reading of "reimbursement" that turned out to be the wrong one: the thing that
-- wanted a link was the shop's refund, which is an expense with a negative
-- amount, not money moving between two members. Nothing ever read it. It is
-- dropped rather than left lying there so that a database migrated through v14
-- and one created tomorrow are the same database -- a schema that differs by
-- when you installed it is a schema nobody can reason about.
--
-- SQLite refuses to drop an indexed column, so the index goes first.
DROP INDEX IF EXISTS idx_payments_expense_id;

ALTER TABLE payments DROP COLUMN expense_id;

-- The expense this one refunds. Optional, and staying optional: a shop handing
-- money back is often about a basket rather than one line of it, and a refund
-- that names nothing is a refund all the same.
--
-- No foreign key, for the reason a deletion gives: a deleted expense really
-- leaves this table, its revision being the only place it still exists, and a
-- restore brings it back under the same id. `ON DELETE SET NULL` would cut every
-- refund loose the moment somebody deleted the purchase it belonged to, and
-- restoring that purchase would not tie them again; `REFERENCES` with no action
-- would refuse the deletion outright. Holding the id plainly lets the link wait:
-- while the expense is away it points at nothing, which the panel reads as "not
-- here", and the day it comes back the link reads again.
ALTER TABLE expenses ADD COLUMN refund_of TEXT;

-- Every refund of one purchase, which is what the purchase side asks: how much
-- of this has come back.
CREATE INDEX idx_expenses_refund_of
    ON expenses(refund_of);

UPDATE schema_version SET version = 15;
