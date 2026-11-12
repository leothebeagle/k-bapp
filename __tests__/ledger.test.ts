// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createTestDb, type Db } from '@/lib/db'
import { migrate } from '@/lib/migrate'

const APPEND_ONLY = /transactions are append-only; add a correcting transaction instead/

describe('ledger', () => {
  let db: Db

  async function balance(): Promise<number> {
    const [row] = await db.query<{ balance: string }>(
      `SELECT balance::text AS balance FROM lots WHERE id = 'lot-1'`,
    )
    return Number(row.balance)
  }

  async function addTransaction(id: string, quantity: number, type: string) {
    await db.query(
      `INSERT INTO transactions (id, lot_id, quantity, type, timestamp)
       VALUES ($1, 'lot-1', $2, $3, now())`,
      [id, quantity, type],
    )
  }

  beforeEach(async () => {
    db = createTestDb()
    await migrate(db)
    await db.query(
      `INSERT INTO items (id, name, stage, stock_unit, shelf_life_days)
       VALUES ('item-1', 'Flour', 'BASE_INPUT', 'KG', 180)`,
    )
    await db.query(
      `INSERT INTO lots (id, item_id, created_at, expires_at)
       VALUES ('lot-1', 'item-1', now(), now() + interval '180 days')`,
    )
  })

  afterEach(async () => {
    await db.close()
  })

  it('adds each inserted quantity to the lot balance', async () => {
    expect(await balance()).toBe(0)
    await addTransaction('tx-1', 14.5, 'restock')
    expect(await balance()).toBe(14.5)
    await addTransaction('tx-2', -5, 'consumed')
    expect(await balance()).toBe(9.5)
  })

  it('rejects updating a transaction and leaves the balance unchanged', async () => {
    await addTransaction('tx-1', 14.5, 'restock')
    await addTransaction('tx-2', -5, 'consumed')

    await expect(
      db.query(`UPDATE transactions SET quantity = 100 WHERE id = 'tx-1'`),
    ).rejects.toThrow(APPEND_ONLY)

    expect(await balance()).toBe(9.5)
    const [tx] = await db.query<{ quantity: string }>(
      `SELECT quantity::text AS quantity FROM transactions WHERE id = 'tx-1'`,
    )
    expect(Number(tx.quantity)).toBe(14.5)
  })

  it('rejects deleting a transaction and leaves the balance unchanged', async () => {
    await addTransaction('tx-1', 14.5, 'restock')
    await addTransaction('tx-2', -5, 'consumed')

    await expect(
      db.query(`DELETE FROM transactions WHERE id = 'tx-2'`),
    ).rejects.toThrow(APPEND_ONLY)

    expect(await balance()).toBe(9.5)
    const [{ count }] = await db.query<{ count: number }>(
      `SELECT count(*)::int AS count FROM transactions`,
    )
    expect(count).toBe(2)
  })
})
