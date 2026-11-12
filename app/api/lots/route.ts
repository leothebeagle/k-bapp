import { connection } from 'next/server'
import { listLots } from '@/lib/data'

export async function GET() {
  // Always read the database at request time, never prerender at build.
  await connection()
  return Response.json(await listLots())
}
