// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createTestDb, type Db } from '@/lib/db'
import { migrate } from '@/lib/migrate'

const APPEND_ONLY = /transactions are append-only; add a correcting transaction instead/

describe('ledger', () => {
  let db: Db

  let lotId: number

  async function balance(): Promise<number> {
    const [row] = await db.query<{ balance: string }>(
      `SELECT balance::text AS balance FROM lots WHERE id = $1`,
      [lotId],
    )
    return Number(row.balance)
  }

  /** Inserts a transaction on the lot and returns its database-assigned ID. */
  async function addTransaction(quantity: number, type: string): Promise<number> {
    const [row] = await db.query<{ id: number }>(
      `INSERT INTO transactions (lot_id, quantity, type, timestamp)
       VALUES ($1, $2, $3, now())
       RETURNING id`,
      [lotId, quantity, type],
    )
    return row.id
  }

  beforeEach(async () => {
    db = createTestDb()
    await migrate(db)
    const [item] = await db.query<{ id: number }>(
      `INSERT INTO items (name, stage, stock_unit, shelf_life_days)
       VALUES ('Flour', 'BASE_INPUT', 'KG', 180)
       RETURNING id`,
    )
    const [lot] = await db.query<{ id: number }>(
      `INSERT INTO lots (item_id, starting_quantity, created_at, expires_at)
       VALUES ($1, 0, now(), now() + interval '180 days')
       RETURNING id`,
      [item.id],
    )
    lotId = lot.id
  })

  afterEach(async () => {
    await db.close()
  })

  it('adds each inserted quantity to the lot balance', async () => {
    expect(await balance()).toBe(0)
    await addTransaction(14.5, 'restock')
    expect(await balance()).toBe(14.5)
    await addTransaction(-5, 'consumed')
    expect(await balance()).toBe(9.5)
  })

  it('rejects updating a transaction and leaves the balance unchanged', async () => {
    const restockId = await addTransaction(14.5, 'restock')
    await addTransaction(-5, 'consumed')

    await expect(
      db.query(`UPDATE transactions SET quantity = 100 WHERE id = $1`, [restockId]),
    ).rejects.toThrow(APPEND_ONLY)

    expect(await balance()).toBe(9.5)
    const [tx] = await db.query<{ quantity: string }>(
      `SELECT quantity::text AS quantity FROM transactions WHERE id = $1`,
      [restockId],
    )
    expect(Number(tx.quantity)).toBe(14.5)
  })

  it('rejects deleting a transaction and leaves the balance unchanged', async () => {
    await addTransaction(14.5, 'restock')
    const consumedId = await addTransaction(-5, 'consumed')

    await expect(
      db.query(`DELETE FROM transactions WHERE id = $1`, [consumedId]),
    ).rejects.toThrow(APPEND_ONLY)

    expect(await balance()).toBe(9.5)
    const [{ count }] = await db.query<{ count: number }>(
      `SELECT count(*)::int AS count FROM transactions`,
    )
    expect(count).toBe(2)
  })
})
