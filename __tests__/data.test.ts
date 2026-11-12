// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createTestDb, type Db } from '@/lib/db'
import { migrate } from '@/lib/migrate'
import { reset } from '@/lib/seed'
import { getStock, listItems, listLots, listTransactions } from '@/lib/data'

// lib/data.ts goes through query(), which uses the shared default db cached on
// globalThis by getDb(). Point that slot at a fresh in-memory database.
const globalForDb = globalThis as typeof globalThis & { __kbappDb?: Db }

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
const DATE = /^\d{4}-\d{2}-\d{2}$/
const DAY_MS = 24 * 60 * 60 * 1000

describe('data', () => {
  let db: Db

  beforeEach(async () => {
    db = createTestDb()
    await migrate(db)
    await reset(db)
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
    const lots = await listLots()
    expect(lots).toEqual([
      {
        id: 'L-1',
        itemId: '001',
        balance: 5,
        createdAt: expect.stringMatching(ISO),
        expiresAt: expect.stringMatching(ISO),
        finishedAt: null,
      },
    ])
    const [lot] = lots
    expect(Date.parse(lot.expiresAt) - Date.parse(lot.createdAt)).toBe(4 * DAY_MS)
  })

  it('listTransactions returns transactions with a numeric quantity', async () => {
    expect(await listTransactions()).toEqual([
      {
        id: 'T-1',
        lotId: 'L-1',
        quantity: 5,
        type: 'restock',
        timestamp: expect.stringMatching(ISO),
      },
    ])
  })

  it('getStock returns one entry per item with its active lots', async () => {
    const stock = await getStock()
    expect(stock).toEqual([
      {
        summary: { item: 'beef-raw', total: '5 KG' },
        details: [
          {
            lot: 'L-1',
            balance: 5,
            created: expect.stringMatching(DATE),
            expires: expect.stringMatching(DATE),
          },
        ],
      },
    ])
    const [lot] = await listLots()
    expect(stock[0].details[0].created).toBe(lot.createdAt.slice(0, 10))
    expect(stock[0].details[0].expires).toBe(lot.expiresAt.slice(0, 10))
  })
})
