-- Minimal seed data: one item, two lots, three transactions.
-- Runs as one script (one implicit transaction). Lot balances are not set
-- here: each transaction insert moves its lot's balance via the ledger trigger
-- (L-1: +5 -2 = 3, L-2: +10 = 10). L-1 and T-1 are dated one day ago; L-2,
-- T-2 and T-3 are dated now, so nothing is in the future.

INSERT INTO items (id, name, stage, stock_unit, shelf_life_days)
VALUES ('001', 'beef-raw', 'BASE_INPUT', 'KG', 4);

INSERT INTO lots (id, item_id, created_at, expires_at)
SELECT 'L-1', id,
       now() - interval '1 day',
       now() - interval '1 day' + make_interval(days => shelf_life_days)
FROM items
WHERE id = '001';

INSERT INTO lots (id, item_id, created_at, expires_at)
SELECT 'L-2', id, now(), now() + make_interval(days => shelf_life_days)
FROM items
WHERE id = '001';

INSERT INTO transactions (id, lot_id, quantity, type, timestamp)
VALUES ('T-1', 'L-1', 5, 'restock', now() - interval '1 day');

INSERT INTO transactions (id, lot_id, quantity, type, timestamp)
VALUES ('T-2', 'L-2', 10, 'restock', now());

INSERT INTO transactions (id, lot_id, quantity, type, timestamp, notes)
VALUES ('T-3', 'L-1', -2, 'consumed', now(), 'Marinated beef');
