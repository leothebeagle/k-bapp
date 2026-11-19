-- IDs are assigned by the database and cannot be supplied on insert. Each
-- table also has a readable code derived from its ID (IT-1, LT-1, TX-1).
--
-- No constraints beyond primary keys and NOT NULL: allowed values, references
-- between tables and uniqueness are not enforced by the database.

CREATE TABLE items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code text GENERATED ALWAYS AS ('IT-' || id) STORED,
  name text NOT NULL,
  stage text NOT NULL,
  stock_unit text NOT NULL,
  shelf_life_days integer NOT NULL
);

CREATE TABLE lots (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code text GENERATED ALWAYS AS ('LT-' || id) STORED,
  item_id bigint NOT NULL,
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  finished_at timestamptz NULL
);

CREATE INDEX lots_item_id_idx ON lots (item_id);

CREATE TABLE transactions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code text GENERATED ALWAYS AS ('TX-' || id) STORED,
  lot_id bigint NOT NULL,
  quantity numeric NOT NULL,
  type text NOT NULL,
  timestamp timestamptz NOT NULL,
  performed_by text NULL,
  notes text NULL
);

CREATE INDEX transactions_lot_id_idx ON transactions (lot_id);
