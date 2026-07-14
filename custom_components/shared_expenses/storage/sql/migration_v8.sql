-- A debt, said as one.
--
-- "Michel owes 46,25 to Dupont" and "Michel reimbursed 46,25 to Dupont" move
-- the money in opposite directions, and the model already said both: `from` is
-- whoever is out of pocket, so a debt is simply the lender as `from`. The
-- balances needed nothing.
--
-- What was missing is the word. Shown as a transfer, a debt read as "Dupont
-- paid Michel" — true of a loan, and nonsense for a debt somebody is only
-- writing down. The kind is here to be read, never to be counted: no balance,
-- no statistic and no settlement looks at it.

ALTER TABLE payments ADD COLUMN kind TEXT NOT NULL DEFAULT 'reimbursement';

UPDATE schema_version SET version = 8;
