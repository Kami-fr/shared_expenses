-- A reimbursement can name the expense it settles.
--
-- Optional, and it stays optional: money handed back at the end of a month
-- answers no single expense, and that is the commonest reimbursement there is.
-- So the column is nullable and nothing anywhere requires it.
--
-- No foreign key, deliberately. A deleted expense is really gone from this
-- table -- its revision is the only place it still exists -- and a reimbursement
-- that named it is not wrong, it is waiting. `ON DELETE SET NULL` would unlink
-- every reimbursement the moment somebody deleted an expense, and restoring it
-- brings the expense back under the same id without bringing the links back;
-- `REFERENCES` with no action would refuse the deletion outright, which is a
-- rule nobody asked for. Holding the id plainly is what lets a delete and a
-- restore leave a reimbursement saying what it always said.
--
-- What it costs is an id that points at nothing while the expense is away. The
-- panel reads that as "not there", which is what it is.

ALTER TABLE payments ADD COLUMN expense_id TEXT;

-- Every reimbursement of one expense, which is the question the expense side
-- asks: who has already paid me back for this.
CREATE INDEX idx_payments_expense_id
    ON payments(expense_id);

UPDATE schema_version SET version = 14;
