-- Minimal seed data: eight items, two lots, two transactions.
-- Runs as one script (one implicit transaction). IDs and codes are assigned
-- by the database, so references are looked up: the item by name, each lot
-- by its item and created_at.
--
-- Both lots are beef-raw. The first (dated one day ago) starts at 5; the
-- second (dated now) starts at 10. Nothing in the database calculates balance
-- or active, so each lot sets them directly: balance equals its one restock
-- transaction (first: 5, second: 10) and both lots are active. The first
-- lot's restock is dated one day ago; the second's is dated now, so nothing
-- is in the future.
insert into items (name, stage, stock_unit, shelf_life_days) values
  ('beef-raw',         'BASE_INPUT',   'KG',    4),
  ('soy-sauce',        'BASE_INPUT',   'LITER', 365),
  ('chicken-raw',      'BASE_INPUT',   'KG',    2),
  ('marinade-beef',    'INTERMEDIARY', 'LITER', 5),
  ('marinade-chicken', 'INTERMEDIARY', 'LITER', 5),
  ('sugar',            'BASE_INPUT',   'KG',    180),
  ('ginger',           'BASE_INPUT',   'KG',    21),
  ('green-onions',     'BASE_INPUT',   'KG',    7);

INSERT INTO lots (item_id, starting_quantity, balance, active, created_at, expires_at)
SELECT id, 5, 5, true,
       now() - interval '1 day',
       now() - interval '1 day' + make_interval(days => shelf_life_days)
FROM items
WHERE name = 'beef-raw';

INSERT INTO lots (item_id, starting_quantity, balance, active, created_at, expires_at)
SELECT id, 10, 10, true, now(), now() + make_interval(days => shelf_life_days)
FROM items
WHERE name = 'beef-raw';

INSERT INTO transactions (lot_id, quantity, type, timestamp)
SELECT l.id, 5, 'restock', now() - interval '1 day'
FROM lots l JOIN items i ON i.id = l.item_id
WHERE i.name = 'beef-raw' AND l.created_at = now() - interval '1 day';

INSERT INTO transactions (lot_id, quantity, type, timestamp)
SELECT l.id, 10, 'restock', now()
FROM lots l JOIN items i ON i.id = l.item_id
WHERE i.name = 'beef-raw' AND l.created_at = now();
