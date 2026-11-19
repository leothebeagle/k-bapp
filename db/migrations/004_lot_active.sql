-- Whether the lot is still in use. A plain column: it is not derived from
-- finished_at, so whatever finishes a lot must set both.
ALTER TABLE lots
  ADD COLUMN active boolean NOT NULL DEFAULT true;
