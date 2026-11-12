import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Db } from './db'

const SEED_FILE = path.join(process.cwd(), 'db', 'seed.sql')

/** Runs db/seed.sql against an already-migrated database. */
export async function seed(db: Db): Promise<void> {
  await db.exec(await readFile(SEED_FILE, 'utf8'))
}

/**
 * Removes all rows from items, lots and transactions, then seeds.
 *
 * Uses TRUNCATE rather than DELETE: transactions are append-only and its
 * row-level DELETE trigger rejects deletes, but TRUNCATE doesn't fire it.
 * Clearing and seeding run in one transaction, so a failed seed leaves the
 * old rows in place.
 */
export async function reset(db: Db): Promise<void> {
  const sql = await readFile(SEED_FILE, 'utf8')
  await db.exec(`TRUNCATE transactions, lots, items;\n${sql}`)
}
