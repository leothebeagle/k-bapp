import { connection } from 'next/server'
import { listTransactions } from '@/lib/server/data/transactions'

export async function GET() {
  // Always read the database at request time, never prerender at build.
  await connection()
  return Response.json(await listTransactions())
}
