// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createTestDb, type Db } from '@/lib/db'
import { migrate } from '@/lib/migrate'

const SUPPLIED_ID = /cannot insert a non-DEFAULT value into column "id"/
const SUPPLIED_CODE = /cannot insert a non-DEFAULT value into column "code"/

describe('database-generated IDs and codes', () => {
  let db: Db

  async function insertItem(name: string) {
    const [row] = await db.query<{ id: number; code: string }>(
      `INSERT INTO items (name, stage, stock_unit, shelf_life_days)
       VALUES ($1, 'BASE_INPUT', 'KG', 4)
       RETURNING id, code`,
      [name],
    )
    return row
  }

  async function insertLot(itemId: number) {
    const [row] = await db.query<{ id: number; code: string }>(
      `INSERT INTO lots (item_id, starting_quantity, created_at, expires_at)
       VALUES ($1, 1, now(), now() + interval '1 day')
       RETURNING id, code`,
      [itemId],
    )
    return row
  }

  async function insertTransaction(lotId: number) {
    const [row] = await db.query<{ id: number; code: string }>(
      `INSERT INTO transactions (lot_id, quantity, type, timestamp)
       VALUES ($1, 1, 'restock', now())
       RETURNING id, code`,
      [lotId],
    )
    return row
  }

  beforeEach(async () => {
    db = createTestDb()
    await migrate(db)
  })

  afterEach(async () => {
    await db.close()
  })

  it('assigns sequential IDs and matching codes to items, lots and transactions', async () => {
    const item1 = await insertItem('beef-raw')
    const item2 = await insertItem('soy-sauce')
    expect([item1, item2]).toEqual([
      { id: 1, code: 'IT-1' },
      { id: 2, code: 'IT-2' },
    ])

    const lot = await insertLot(item1.id)
    expect(lot).toEqual({ id: 1, code: 'LT-1' })

    const tx = await insertTransaction(lot.id)
    expect(tx).toEqual({ id: 1, code: 'TX-1' })
  })

  it('gives a new lot the code LT- plus its ID', async () => {
    const item = await insertItem('beef-raw')
    // Advance the sequence so the ID isn't just 1.
    await insertLot(item.id)
    await insertLot(item.id)

    const lot = await insertLot(item.id)
    expect(lot.id).toBe(3)
    expect(lot.code).toBe(`LT-${lot.id}`)

    const [stored] = await db.query<{ code: string }>(`SELECT code FROM lots WHERE id = $1`, [
      lot.id,
    ])
    expect(stored.code).toBe('LT-3')
  })

  it('rejects a supplied ID on each table', async () => {
    const item = await insertItem('beef-raw')
    const lot = await insertLot(item.id)

    await expect(
      db.query(
        `INSERT INTO items (id, name, stage, stock_unit, shelf_life_days)
         VALUES (100, 'sugar', 'BASE_INPUT', 'KG', 180)`,
      ),
    ).rejects.toThrow(SUPPLIED_ID)
    await expect(
      db.query(
        `INSERT INTO lots (id, item_id, starting_quantity, created_at, expires_at)
         VALUES (100, $1, 1, now(), now() + interval '1 day')`,
        [item.id],
      ),
    ).rejects.toThrow(SUPPLIED_ID)
    await expect(
      db.query(
        `INSERT INTO transactions (id, lot_id, quantity, type, timestamp)
         VALUES (100, $1, 1, 'restock', now())`,
        [lot.id],
      ),
    ).rejects.toThrow(SUPPLIED_ID)

    const [counts] = await db.query(
      `SELECT (SELECT count(*)::int FROM items) AS items,
              (SELECT count(*)::int FROM lots) AS lots,
              (SELECT count(*)::int FROM transactions) AS transactions`,
    )
    expect(counts).toEqual({ items: 1, lots: 1, transactions: 0 })
  })

  it('rejects a supplied code on each table', async () => {
    const item = await insertItem('beef-raw')
    const lot = await insertLot(item.id)

    await expect(
      db.query(
        `INSERT INTO items (code, name, stage, stock_unit, shelf_life_days)
         VALUES ('IT-100', 'sugar', 'BASE_INPUT', 'KG', 180)`,
      ),
    ).rejects.toThrow(SUPPLIED_CODE)
    await expect(
      db.query(
        `INSERT INTO lots (code, item_id, starting_quantity, created_at, expires_at)
         VALUES ('LT-100', $1, 1, now(), now() + interval '1 day')`,
        [item.id],
      ),
    ).rejects.toThrow(SUPPLIED_CODE)
    await expect(
      db.query(
        `INSERT INTO transactions (code, lot_id, quantity, type, timestamp)
         VALUES ('TX-100', $1, 1, 'restock', now())`,
        [lot.id],
      ),
    ).rejects.toThrow(SUPPLIED_CODE)

    const [counts] = await db.query(
      `SELECT (SELECT count(*)::int FROM items) AS items,
              (SELECT count(*)::int FROM lots) AS lots,
              (SELECT count(*)::int FROM transactions) AS transactions`,
    )
    expect(counts).toEqual({ items: 1, lots: 1, transactions: 0 })
  })
})
