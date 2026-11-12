// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest'
import { createTestDb, type Db } from '@/lib/db'

describe('createTestDb', () => {
  let db: Db | undefined

  afterEach(async () => {
    await db?.close()
    db = undefined
  })

  it('runs a query against a fresh in-memory database', async () => {
    db = createTestDb()
    const rows = await db.query('select 1 as one')
    expect(rows).toEqual([{ one: 1 }])
  })
})
