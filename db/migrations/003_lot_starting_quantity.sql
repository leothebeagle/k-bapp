-- Each lot stores the quantity it started with.
--
-- lots and transactions only hold seed data, so they are cleared rather than
-- backfilled. Run `npm run db:reset` afterwards to re-seed.
TRUNCATE transactions, lots;

ALTER TABLE lots ADD COLUMN starting_quantity numeric NOT NULL;
