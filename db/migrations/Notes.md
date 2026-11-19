working on the supply-restock feature:

on receiving a request, we want to

- run some checks on the request received.

- we then want to generate an entry into LOTs with the relevant information.

- Here we can stop to see if lots gets correctly updated.

- Then we would like to generate an entry into transactions with the relevant information.

- Here we can stop to see if transactionsa are correctly updated.

- then should generate a response if everything was successful that sends back the transaction and lots details.

- this should display in the alert on the frontend

how items looks like:
[
{ id: 1, code: 'IT-1', name: 'beef-raw', stage: 'BASE_INPUT', stockUnit: 'KG', shelfLifeDays: 4 },
{ id: 2, code: 'IT-2', name: 'soy-sauce', stage: 'BASE_INPUT', stockUnit: 'LITER', shelfLifeDays: 365 },
{ id: 3, code: 'IT-3', name: 'chicken-raw', stage: 'BASE_INPUT', stockUnit: 'KG', shelfLifeDays: 2 },
{ id: 4, code: 'IT-4', name: 'marinade-beef', stage: 'INTERMEDIARY', stockUnit: 'LITER', shelfLifeDays: 5 },
{ id: 5, code: 'IT-5', name: 'marinade-chicken', stage: 'INTERMEDIARY', stockUnit: 'LITER', shelfLifeDays: 5 },
{ id: 6, code: 'IT-6', name: 'sugar', stage: 'BASE_INPUT', stockUnit: 'KG', shelfLifeDays: 180 },
{ id: 7, code: 'IT-7', name: 'ginger', stage: 'BASE_INPUT', stockUnit: 'KG', shelfLifeDays: 21 },
{ id: 8, code: 'IT-8', name: 'green-onions', stage: 'BASE_INPUT', stockUnit: 'KG', shelfLifeDays: 7 },
]

we .map() over the items array and turn each item into a 2 element array. this will allow us to create a lookup table in the next step:

[
[1, { id: 1, code: 'IT-1', name: 'beef-raw', stockUnit: 'KG', ... }],
[2, { id: 2, code: 'IT-2', name: 'soy-sauce', stockUnit: 'LITER', ... }],
[3, { id: 3, code: 'IT-3', name: 'chicken-raw', ... }],
...
[8, { id: 8, code: 'IT-8', name: 'green-onions', ... }],
]

we generate a Map object which is essentially a lookup table from items:
{
1 => { id: 1, code: 'IT-1', name: 'beef-raw', stockUnit: 'KG', ... },
2 => { id: 2, code: 'IT-2', name: 'soy-sauce', stockUnit: 'LITER', ... },
3 => { id: 3, code: 'IT-3', name: 'chicken-raw', stockUnit: 'KG', ... },
...
8 => { id: 8, code: 'IT-8', name: 'green-onions', stockUnit: 'KG', ... },
}

how the request looks like:
{ "restockFormItems": [{ "itemId": 1, "quantity": 2.5 }, { "itemId": 2, "quantity": 10 }] }

now we can query the map to check the request.
so the request sends us a bunch of items we can grab each item id and see if it exists in the lookup table. if it doesnt, then we know something is off.

A Map object / lookup table is faster than iterating over an array. which we could also just do btw.

now assuming all our checks are passing, we now want to persist the items as new lots. i.e create a new entry, so we will take the bits that we fill in ourselves (like the name and quantity and unit) and leave out the bits that the DB fills in, ex: created_at or id etc.

[] need a function that will accept arguments for each item of the supply restock form and insert an entry into the Lots table.

[x] should split db interactions into their logical groupings. ex lib/data/transactions

---

\*i am not sure how the DB transactions work and why we are calculating things in the DB.
I think it will be useful to have a stock table, but will explore later.

I removed the db constraints for now. this was what was removed:
001_tables.sql

- Check constraints:
  - items.stage: had to be one of BASE_INPUT, INTERMEDIARY, PRODUCTION_READY, FINAL_PRODUCT
  - items.stock_unit: had to be one of KG, LITER, UNIT, PORTION, ROLL, BATCH
  - transactions.type: had to be one of restock, batch_made, consumed, adjustment, sale
- Foreign keys:
  - lots.item_id → items(id)
  - transactions.lot_id → lots(id)
- Unique constraints:
  - items.name
  - items.code, lots.code, transactions.code

002_ledger.sql: I deleted the whole file, since every line in it was a rule.

- The trigger transactions_apply_balance and its function apply_transaction_to_lot_balance(), which added each new transaction's quantity to lots.balance.
- The trigger transactions_append_only and its function reject_transaction_change(), which blocked updating or deleting transactions.

003_lot_starting_quantity.sql

- The trigger lots_starting_quantity_immutable and its function reject_starting_quantity_change(), which locked starting_quantity. The column itself is still there.

004_lot_active.sql

- active was generated from finished_at IS NULL. It's now boolean NOT NULL DEFAULT true.

What stayed:

- Primary keys, identity IDs, and the generated codes (IT-1, LT-1, TX-1).
- NOT NULL on columns and balance DEFour list; say if you want them gonetoo.
- The two indexes, on lots.item_id any speed up lookups but don't enforceanything.

---
