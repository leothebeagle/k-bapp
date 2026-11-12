import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Db } from './db'

const MIGRATIONS_DIR = path.join(process.cwd(), 'db', 'migrations')

// Filenames are inlined into SQL below, so only allow safe characters.
const MIGRATION_NAME = /^[A-Za-z0-9_.-]+\.sql$/

/**
 * Applies every .sql file in db/migrations/ in filename order, skipping files
 * already recorded in schema_migrations. Each file runs together with its
 * schema_migrations insert as one transaction, so a failing migration leaves
 * nothing behind. Migration files must not contain their own BEGIN/COMMIT.
 *
 * Returns the filenames applied by this call.
 */
export async function migrate(db: Db): Promise<string[]> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `)

  const rows = await db.query<{ name: string }>('SELECT name FROM schema_migrations')
  const done = new Set(rows.map((r) => r.name))

  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith('.sql')).sort()

  const applied: string[] = []
  for (const file of files) {
    if (done.has(file)) continue
    if (!MIGRATION_NAME.test(file)) {
      throw new Error(`Invalid migration filename: ${file}`)
    }
    const sql = await readFile(path.join(MIGRATIONS_DIR, file), 'utf8')
    // One multi-statement script = one implicit transaction in Postgres.
    await db.exec(`${sql}\n;\nINSERT INTO schema_migrations (name) VALUES ('${file}');`)
    applied.push(file)
  }
  return applied
}
