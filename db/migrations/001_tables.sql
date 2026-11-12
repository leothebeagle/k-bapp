CREATE TABLE items (
  id text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  stage text NOT NULL
    CHECK (stage IN ('BASE_INPUT', 'INTERMEDIARY', 'PRODUCTION_READY', 'FINAL_PRODUCT')),
  stock_unit text NOT NULL
    CHECK (stock_unit IN ('KG', 'LITER', 'UNIT', 'PORTION', 'ROLL', 'BATCH')),
  shelf_life_days integer NOT NULL
);

CREATE TABLE lots (
  id text PRIMARY KEY,
  item_id text NOT NULL REFERENCES items (id),
  balance numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  finished_at timestamptz NULL
);

CREATE INDEX lots_item_id_idx ON lots (item_id);

CREATE TABLE transactions (
  id text PRIMARY KEY,
  lot_id text NOT NULL REFERENCES lots (id),
  quantity numeric NOT NULL,
  type text NOT NULL
    CHECK (type IN ('restock', 'batch_made', 'consumed', 'adjustment', 'sale')),
  timestamp timestamptz NOT NULL,
  performed_by text NULL,
  notes text NULL
);

CREATE INDEX transactions_lot_id_idx ON transactions (lot_id);
