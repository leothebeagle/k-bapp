// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createTestDb, type Db } from '@/lib/db'
import { migrate } from '@/lib/migrate'
import { reset, seed } from '@/lib/seed'

describe('seed', () => {
  let db: Db

  async function counts() {
    const [row] = await db.query<{ items: number; lots: number; transactions: number }>(
      `SELECT (SELECT count(*)::int FROM items) AS items,
              (SELECT count(*)::int FROM lots) AS lots,
              (SELECT count(*)::int FROM transactions) AS transactions`,
    )
    return row
  }

  async function lotBalances(): Promise<number[]> {
    const rows = await db.query<{ balance: string }>(`SELECT balance::text AS balance FROM lots`)
    return rows.map((r) => Number(r.balance))
  }

  beforeEach(async () => {
    db = createTestDb()
    await migrate(db)
  })

  afterEach(async () => {
    await db.close()
  })

  it('inserts 1 item, 1 lot with balance 5, and 1 transaction', async () => {
    await seed(db)
    expect(await counts()).toEqual({ items: 1, lots: 1, transactions: 1 })
    expect(await lotBalances()).toEqual([5])

    const items = await db.query(`SELECT id, name FROM items`)
    expect(items).toEqual([{ id: '001', name: 'beef-raw' }])
    const lots = await db.query(`SELECT id, item_id FROM lots`)
    expect(lots).toEqual([{ id: 'L-1', item_id: '001' }])
    const transactions = await db.query(`SELECT id, lot_id FROM transactions`)
    expect(transactions).toEqual([{ id: 'T-1', lot_id: 'L-1' }])
  })

  it('reset clears existing rows and leaves just the seed data', async () => {
    await seed(db)
    await db.query(
      `INSERT INTO transactions (id, lot_id, quantity, type, timestamp)
       VALUES ('extra', 'L-1', -2, 'consumed', now())`,
    )

    await reset(db)
    expect(await counts()).toEqual({ items: 1, lots: 1, transactions: 1 })
    expect(await lotBalances()).toEqual([5])
  })
})
