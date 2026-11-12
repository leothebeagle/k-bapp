-- A lot is active until it is finished. active is derived from finished_at by
-- Postgres and cannot be written directly; set finished_at to finish a lot.
ALTER TABLE lots
  ADD COLUMN active boolean GENERATED ALWAYS AS (finished_at IS NULL) STORED;
