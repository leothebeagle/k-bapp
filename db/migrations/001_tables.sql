-- IDs are assigned by the database and cannot be supplied on insert. Each
-- table also has a readable code derived from its ID (IT-1, LT-1, TX-1).

CREATE TABLE items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code text GENERATED ALWAYS AS ('IT-' || id) STORED UNIQUE,
  name text NOT NULL UNIQUE,
  stage text NOT NULL
    CHECK (stage IN ('BASE_INPUT', 'INTERMEDIARY', 'PRODUCTION_READY', 'FINAL_PRODUCT')),
  stock_unit text NOT NULL
    CHECK (stock_unit IN ('KG', 'LITER', 'UNIT', 'PORTION', 'ROLL', 'BATCH')),
  shelf_life_days integer NOT NULL
);

CREATE TABLE lots (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code text GENERATED ALWAYS AS ('LT-' || id) STORED UNIQUE,
  item_id bigint NOT NULL REFERENCES items (id),
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  finished_at timestamptz NULL
);

CREATE INDEX lots_item_id_idx ON lots (item_id);

CREATE TABLE transactions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code text GENERATED ALWAYS AS ('TX-' || id) STORED UNIQUE,
  lot_id bigint NOT NULL REFERENCES lots (id),
  quantity numeric NOT NULL,
  type text NOT NULL
    CHECK (type IN ('restock', 'batch_made', 'consumed', 'adjustment', 'sale')),
  timestamp timestamptz NOT NULL,
  performed_by text NULL,
  notes text NULL
);

CREATE INDEX transactions_lot_id_idx ON transactions (lot_id);
