// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createTestDb, type Db } from '@/lib/db'
import { migrate } from '@/lib/migrate'
import { getStock, listItems, listLots, listTransactions } from '@/lib/data'

// lib/data.ts goes through query(), which uses the shared default db cached on
// globalThis by getDb(). Point that slot at a fresh in-memory database.
const globalForDb = globalThis as typeof globalThis & { __kbappDb?: Db }

// Fixed timestamps so results are exact and independent of the seed and clock.
const L1_CREATED = '2026-03-01T08:00:00.000Z'
const L1_EXPIRES = '2026-03-05T08:00:00.000Z'
const L2_CREATED = '2026-03-02T08:00:00.000Z'
const L2_EXPIRES = '2026-03-06T08:00:00.000Z'
const T3_TIME = '2026-03-02T12:00:00.000Z'

/** One item; L-1 gets +5 restock then -2 consumed, L-2 gets +10 restock. */
async function insertFixtures(db: Db): Promise<void> {
  await db.query(
    `INSERT INTO items (id, name, stage, stock_unit, shelf_life_days)
     VALUES ('001', 'beef-raw', 'BASE_INPUT', 'KG', 4)`,
  )
  await db.query(
    `INSERT INTO lots (id, item_id, created_at, expires_at)
     VALUES ('L-1', '001', $1, $2), ('L-2', '001', $3, $4)`,
    [L1_CREATED, L1_EXPIRES, L2_CREATED, L2_EXPIRES],
  )
  await db.query(
    `INSERT INTO transactions (id, lot_id, quantity, type, timestamp)
     VALUES ('T-1', 'L-1', 5, 'restock', $1),
            ('T-2', 'L-2', 10, 'restock', $2),
            ('T-3', 'L-1', -2, 'consumed', $3)`,
    [L1_CREATED, L2_CREATED, T3_TIME],
  )
}

describe('data', () => {
  let db: Db

  beforeEach(async () => {
    db = createTestDb()
    await migrate(db)
    await insertFixtures(db)
    globalForDb.__kbappDb = db
  })

  afterEach(async () => {
    globalForDb.__kbappDb = undefined
    await db.close()
  })

  it('listItems returns items with camelCase keys', async () => {
    expect(await listItems()).toEqual([
      { id: '001', name: 'beef-raw', stage: 'BASE_INPUT', stockUnit: 'KG', shelfLifeDays: 4 },
    ])
  })

  it('listLots returns lots with a numeric balance and ISO timestamps', async () => {
    expect(await listLots()).toEqual([
      {
        id: 'L-1',
        itemId: '001',
        balance: 3,
        createdAt: L1_CREATED,
        expiresAt: L1_EXPIRES,
        finishedAt: null,
      },
      {
        id: 'L-2',
        itemId: '001',
        balance: 10,
        createdAt: L2_CREATED,
        expiresAt: L2_EXPIRES,
        finishedAt: null,
      },
    ])
  })

  it('listTransactions returns transactions with a numeric quantity', async () => {
    expect(await listTransactions()).toEqual([
      { id: 'T-1', lotId: 'L-1', quantity: 5, type: 'restock', timestamp: L1_CREATED },
      { id: 'T-2', lotId: 'L-2', quantity: 10, type: 'restock', timestamp: L2_CREATED },
      { id: 'T-3', lotId: 'L-1', quantity: -2, type: 'consumed', timestamp: T3_TIME },
    ])
  })

  it('getStock returns one entry per item with its active lots', async () => {
    expect(await getStock()).toEqual([
      {
        summary: { item: 'beef-raw', total: '13 KG' },
        details: [
          { lot: 'L-1', balance: 3, created: '2026-03-01', expires: '2026-03-05' },
          { lot: 'L-2', balance: 10, created: '2026-03-02', expires: '2026-03-06' },
        ],
      },
    ])
  })
})
