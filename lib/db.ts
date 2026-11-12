import path from 'node:path'
import { Pool } from 'pg'
import { PGlite } from '@electric-sql/pglite'

export type Row = Record<string, unknown>

export interface Db {
  query<T extends Row = Row>(sql: string, params?: unknown[]): Promise<T[]>
  close(): Promise<void>
}

function fromPool(pool: Pool): Db {
  return {
    async query<T extends Row = Row>(sql: string, params?: unknown[]) {
      const result = await pool.query(sql, params)
      return result.rows as T[]
    },
    close: () => pool.end(),
  }
}

function fromPGlite(pglite: PGlite): Db {
  return {
    async query<T extends Row = Row>(sql: string, params?: unknown[]) {
      const result = await pglite.query<T>(sql, params)
      return result.rows
    },
    close: () => pglite.close(),
  }
}

function createDefaultDb(): Db {
  const url = process.env.DATABASE_URL
  if (url) {
    return fromPool(new Pool({ connectionString: url }))
  }
  return fromPGlite(new PGlite(path.join(process.cwd(), '.pglite')))
}

// Cache on globalThis so Next.js dev hot reloads don't open a second
// connection pool or a second PGlite instance on the same data directory.
const globalForDb = globalThis as typeof globalThis & { __kbappDb?: Db }

function getDb(): Db {
  if (!globalForDb.__kbappDb) {
    globalForDb.__kbappDb = createDefaultDb()
  }
  return globalForDb.__kbappDb
}

export function query<T extends Row = Row>(
  sql: string,
  params?: unknown[],
): Promise<T[]> {
  return getDb().query<T>(sql, params)
}

/** A fresh in-memory PGlite database with the same query interface, for tests. */
export function createTestDb(): Db {
  return fromPGlite(new PGlite())
}
