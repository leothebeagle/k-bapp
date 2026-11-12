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

  async function lotQuantities() {
    const rows = await db.query<{ id: string; starting: string; balance: string }>(
      `SELECT id, starting_quantity::text AS starting, balance::text AS balance FROM lots ORDER BY id`,
    )
    return rows.map((r) => ({ id: r.id, starting: Number(r.starting), balance: Number(r.balance) }))
  }

  const SEEDED_LOTS = [
    { id: 'L-1', starting: 5, balance: 3 },
    { id: 'L-2', starting: 10, balance: 10 },
  ]

  beforeEach(async () => {
    db = createTestDb()
    await migrate(db)
  })

  afterEach(async () => {
    await db.close()
  })

  it('inserts 1 item, 2 lots (L-1 starting 5 balance 3, L-2 starting 10 balance 10), and 3 transactions', async () => {
    await seed(db)
    expect(await counts()).toEqual({ items: 1, lots: 2, transactions: 3 })
    expect(await lotQuantities()).toEqual(SEEDED_LOTS)

    const items = await db.query(`SELECT id, name FROM items`)
    expect(items).toEqual([{ id: '001', name: 'beef-raw' }])
    const lots = await db.query(`SELECT id, item_id FROM lots ORDER BY id`)
    expect(lots).toEqual([
      { id: 'L-1', item_id: '001' },
      { id: 'L-2', item_id: '001' },
    ])

    const [lotDates] = await db.query<{ created_gap: string; l2_shelf_life: string }>(
      `SELECT (l2.created_at - l1.created_at)::text AS created_gap,
              (l2.expires_at - l2.created_at)::text AS l2_shelf_life
       FROM lots l1, lots l2
       WHERE l1.id = 'L-1' AND l2.id = 'L-2'`,
    )
    expect(lotDates).toEqual({ created_gap: '1 day', l2_shelf_life: '4 days' })

    // L-1 and T-1 are dated one day ago; L-2, T-2 and T-3 at seed time. None in the future.
    const dated = await db.query<{ id: string; age: string; future: boolean }>(
      `SELECT id, date_trunc('day', now() - created_at)::text AS age, created_at > now() AS future
       FROM lots
       UNION ALL
       SELECT id, date_trunc('day', now() - timestamp)::text, timestamp > now()
       FROM transactions
       ORDER BY id`,
    )
    expect(dated).toEqual([
      { id: 'L-1', age: '1 day', future: false },
      { id: 'L-2', age: '00:00:00', future: false },
      { id: 'T-1', age: '1 day', future: false },
      { id: 'T-2', age: '00:00:00', future: false },
      { id: 'T-3', age: '00:00:00', future: false },
    ])

    const transactions = await db.query(
      `SELECT id, lot_id, quantity::text AS quantity, type, notes FROM transactions ORDER BY id`,
    )
    expect(transactions).toEqual([
      { id: 'T-1', lot_id: 'L-1', quantity: '5', type: 'restock', notes: null },
      { id: 'T-2', lot_id: 'L-2', quantity: '10', type: 'restock', notes: null },
      { id: 'T-3', lot_id: 'L-1', quantity: '-2', type: 'consumed', notes: 'Marinated beef' },
    ])
  })

  it('reset clears existing rows and leaves just the seed data', async () => {
    await seed(db)
    await db.query(
      `INSERT INTO transactions (id, lot_id, quantity, type, timestamp)
       VALUES ('extra', 'L-1', -2, 'consumed', now())`,
    )

    await reset(db)
    expect(await counts()).toEqual({ items: 1, lots: 2, transactions: 3 })
    expect(await lotQuantities()).toEqual(SEEDED_LOTS)
  })
})
