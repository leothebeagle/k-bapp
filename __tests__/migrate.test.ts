// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createTestDb, type Db } from '@/lib/server/db/db'
import { migrate } from '@/lib/server/db/migrate'

describe('migrate', () => {
  let db: Db

  beforeEach(() => {
    db = createTestDb()
  })

  afterEach(async () => {
    await db.close()
  })

  it('creates the items, lots and transactions tables on a fresh database', async () => {
    const applied = await migrate(db)
    expect(applied).toContain('001_tables.sql')

    const rows = await db.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name IN ('items', 'lots', 'transactions')
       ORDER BY table_name`,
    )
    expect(rows.map((r) => r.table_name)).toEqual(['items', 'lots', 'transactions'])
  })

  it('applies nothing when run a second time', async () => {
    const first = await migrate(db)
    expect(first.length).toBeGreaterThan(0)

    const second = await migrate(db)
    expect(second).toEqual([])

    const recorded = await db.query<{ name: string }>(
      'SELECT name FROM schema_migrations ORDER BY name',
    )
    expect(recorded.map((r) => r.name)).toEqual(first)
  })
})
