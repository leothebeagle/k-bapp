import { getDb } from '../lib/db'
import { migrate } from '../lib/migrate'
import { reset, seed } from '../lib/seed'

async function main() {
  const doReset = process.argv.includes('--reset')
  const db = getDb()
  try {
    if (doReset) {
      // Bring a brand-new (or behind) database up to date before clearing it.
      for (const name of await migrate(db)) console.log(`Applied ${name}`)
      await reset(db)
      console.log('Cleared items, lots and transactions, then seeded.')
    } else {
      await seed(db)
      console.log('Seeded.')
    }
  } finally {
    await db.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
