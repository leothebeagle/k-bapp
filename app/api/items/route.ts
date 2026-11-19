import { connection } from 'next/server';
import { listItems } from '@/lib/server/data/items';

export async function GET() {
  // Always read the database at request time, never prerender at build.
  await connection();
  return Response.json(await listItems());
}
