// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createTestDb, type Db } from '@/lib/server/db/db'
import { migrate } from '@/lib/server/db/migrate'
import { POST } from '@/app/api/supply-restock/route'

// The route reads items through query(), which uses the shared default db
// cached on globalThis by getDb(). Point that slot at a fresh in-memory database.
const globalForDb = globalThis as typeof globalThis & { __kbappDb?: Db }

function post(body?: string) {
  return POST(
    new Request('http://localhost/api/supply-restock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    }),
  )
}

describe('POST /api/supply-restock', () => {
  let db: Db

  beforeEach(async () => {
    db = createTestDb()
    await migrate(db)
    // Fresh database, so these get ids 1 and 2.
    await db.query(
      `INSERT INTO items (name, stage, stock_unit, shelf_life_days)
       VALUES ('beef-raw', 'BASE_INPUT', 'KG', 4),
              ('soy-sauce', 'BASE_INPUT', 'LITER', 365)`,
    )
    globalForDb.__kbappDb = db
  })

  afterEach(async () => {
    globalForDb.__kbappDb = undefined
    await db.close()
  })

  it('returns a message listing each item with its quantity and unit', async () => {
    const response = await post(
      JSON.stringify({
        restockFormItems: [
          { itemId: 1, quantity: 15 },
          { itemId: 2, quantity: 2 },
        ],
      }),
    )
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      message: 'Successfully restocked: beef-raw 15 KG, soy-sauce 2 LITER',
    })
  })

  it.each([
    ['no body', undefined],
    ['invalid JSON', '{restockFormItems:'],
    ['null', 'null'],
    ['no restockFormItems', '{}'],
    ['empty restockFormItems', '{"restockFormItems":[]}'],
    ['restockFormItems not an array', '{"restockFormItems":{"itemId":1,"quantity":5}}'],
    ['missing quantity', '{"restockFormItems":[{"itemId":1}]}'],
    ['string quantity', '{"restockFormItems":[{"itemId":1,"quantity":"5"}]}'],
    ['zero quantity', '{"restockFormItems":[{"itemId":1,"quantity":0}]}'],
    ['negative quantity', '{"restockFormItems":[{"itemId":1,"quantity":-1}]}'],
    ['non-integer itemId', '{"restockFormItems":[{"itemId":1.5,"quantity":5}]}'],
    ['unknown itemId', '{"restockFormItems":[{"itemId":99,"quantity":5}]}'],
  ])('returns 400 for %s', async (_, body) => {
    const response = await post(body)
    expect(response.status).toBe(400)
    expect(await response.json()).toHaveProperty('error')
  })
})
