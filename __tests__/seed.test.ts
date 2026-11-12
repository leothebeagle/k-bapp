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
    const rows = await db.query<{ code: string; starting: string; balance: string }>(
      `SELECT code, starting_quantity::text AS starting, balance::text AS balance
       FROM lots ORDER BY created_at`,
    )
    return rows.map((r) => ({
      code: r.code,
      starting: Number(r.starting),
      balance: Number(r.balance),
    }))
  }

  // Lots in created_at order: the one dated a day ago, then the one dated now.
  const SEEDED_LOTS = [
    { starting: 5, balance: 5 },
    { starting: 10, balance: 10 },
  ]

  beforeEach(async () => {
    db = createTestDb()
    await migrate(db)
  })

  afterEach(async () => {
    await db.close()
  })

  it('inserts 8 items, 2 lots (starting 5 balance 5, starting 10 balance 10), and 2 transactions', async () => {
    await seed(db)
    expect(await counts()).toEqual({ items: 8, lots: 2, transactions: 2 })
    expect((await lotQuantities()).map(({ starting, balance }) => ({ starting, balance }))).toEqual(
      SEEDED_LOTS,
    )

    // IDs and codes come from the database; a fresh database starts at 1.
    const items = await db.query(`SELECT id, code, name FROM items ORDER BY id`)
    expect(items).toEqual([
      { id: 1, code: 'IT-1', name: 'beef-raw' },
      { id: 2, code: 'IT-2', name: 'soy-sauce' },
      { id: 3, code: 'IT-3', name: 'chicken-raw' },
      { id: 4, code: 'IT-4', name: 'marinade-beef' },
      { id: 5, code: 'IT-5', name: 'marinade-chicken' },
      { id: 6, code: 'IT-6', name: 'sugar' },
      { id: 7, code: 'IT-7', name: 'ginger' },
      { id: 8, code: 'IT-8', name: 'green-onions' },
    ])

    const lots = await db.query(
      `SELECT l.id, l.code, i.name AS item FROM lots l JOIN items i ON i.id = l.item_id
       ORDER BY l.created_at`,
    )
    expect(lots).toEqual([
      { id: 1, code: 'LT-1', item: 'beef-raw' },
      { id: 2, code: 'LT-2', item: 'beef-raw' },
    ])

    const [lotDates] = await db.query<{ created_gap: string; l2_shelf_life: string }>(
      `SELECT (l2.created_at - l1.created_at)::text AS created_gap,
              (l2.expires_at - l2.created_at)::text AS l2_shelf_life
       FROM lots l1, lots l2
       WHERE l1.code = 'LT-1' AND l2.code = 'LT-2'`,
    )
    expect(lotDates).toEqual({ created_gap: '1 day', l2_shelf_life: '4 days' })

    // LT-1 and TX-1 are dated one day ago; LT-2 and TX-2 at seed time. None in the future.
    const dated = await db.query<{ code: string; age: string; future: boolean }>(
      `SELECT code, date_trunc('day', now() - created_at)::text AS age, created_at > now() AS future
       FROM lots
       UNION ALL
       SELECT code, date_trunc('day', now() - timestamp)::text, timestamp > now()
       FROM transactions
       ORDER BY code`,
    )
    expect(dated).toEqual([
      { code: 'LT-1', age: '1 day', future: false },
      { code: 'LT-2', age: '00:00:00', future: false },
      { code: 'TX-1', age: '1 day', future: false },
      { code: 'TX-2', age: '00:00:00', future: false },
    ])

    const transactions = await db.query(
      `SELECT t.code, l.code AS lot, t.quantity::text AS quantity, t.type, t.notes
       FROM transactions t JOIN lots l ON l.id = t.lot_id
       ORDER BY t.id`,
    )
    expect(transactions).toEqual([
      { code: 'TX-1', lot: 'LT-1', quantity: '5', type: 'restock', notes: null },
      { code: 'TX-2', lot: 'LT-2', quantity: '10', type: 'restock', notes: null },
    ])
  })

  it('reset clears existing rows and leaves just the seed data', async () => {
    await seed(db)
    await db.query(
      `INSERT INTO transactions (lot_id, quantity, type, timestamp)
       SELECT id, -2, 'consumed', now() FROM lots WHERE code = 'LT-1'`,
    )

    await reset(db)
    expect(await counts()).toEqual({ items: 8, lots: 2, transactions: 2 })
    // TRUNCATE doesn't restart identity sequences, so the re-seeded rows get new
    // IDs; the quantities are the same and each code still matches its ID.
    const lots = await lotQuantities()
    expect(lots.map(({ starting, balance }) => ({ starting, balance }))).toEqual(SEEDED_LOTS)
    const ids = await db.query<{ id: number; code: string }>(`SELECT id, code FROM lots`)
    for (const { id, code } of ids) expect(code).toBe(`LT-${id}`)
  })
})
