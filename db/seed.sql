-- Minimal seed data: one item, one lot, one restock.
-- Runs as one script (one implicit transaction). The lot's balance is not set
-- here: the restock insert moves it to 5 via the ledger trigger.

INSERT INTO items (id, name, stage, stock_unit, shelf_life_days)
VALUES ('001', 'beef-raw', 'BASE_INPUT', 'KG', 4);

INSERT INTO lots (id, item_id, created_at, expires_at)
SELECT 'L-1', id, now(), now() + make_interval(days => shelf_life_days)
FROM items
WHERE id = '001';

INSERT INTO transactions (id, lot_id, quantity, type, timestamp)
VALUES ('T-1', 'L-1', 5, 'restock', now());
