import { getDb } from '../lib/db'

async function main() {
  const sql = process.argv.slice(2).join(' ').trim()
  if (!sql) {
    console.error('Usage: npm run db:sql -- "<SQL query>"')
    process.exit(1)
  }

  const db = getDb()
  try {
    const rows = await db.query(sql)
    if (rows.length === 0) {
      console.log('(0 rows)')
    } else {
      console.table(rows)
    }
  } finally {
    await db.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
