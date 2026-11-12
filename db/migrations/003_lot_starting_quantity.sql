-- Each lot stores the quantity it started with. It is set when the lot is
-- inserted and never changes afterwards; balance still moves via the ledger.
--
-- lots and transactions only hold seed data, so they are cleared rather than
-- backfilled. Run `npm run db:reset` afterwards to re-seed.
TRUNCATE transactions, lots;

ALTER TABLE lots ADD COLUMN starting_quantity numeric NOT NULL;

CREATE FUNCTION reject_starting_quantity_change() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'lots.starting_quantity cannot change after the lot is created'
    USING ERRCODE = 'restrict_violation',
          DETAIL = format('starting_quantity change on lot %s was rejected', OLD.id);
END;
$$;

CREATE TRIGGER lots_starting_quantity_immutable
  BEFORE UPDATE OF starting_quantity ON lots
  FOR EACH ROW
  WHEN (NEW.starting_quantity IS DISTINCT FROM OLD.starting_quantity)
  EXECUTE FUNCTION reject_starting_quantity_change();
