import { getDb } from '../lib/db'
import { migrate } from '../lib/migrate'

async function main() {
  const db = getDb()
  try {
    const applied = await migrate(db)
    if (applied.length === 0) {
      console.log('No pending migrations.')
    } else {
      for (const name of applied) console.log(`Applied ${name}`)
    }
  } finally {
    await db.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
