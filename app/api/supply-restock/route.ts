import { listItems } from '@/lib/data'
import type { RestockLine } from '@/lib/restock'

function badRequest(error: string) {
  return Response.json({ error }, { status: 400 })
}

function isLine(value: unknown): value is RestockLine {
  if (typeof value !== 'object' || value === null) return false
  const { itemId, quantity } = value as Record<string, unknown>
  return (
    Number.isInteger(itemId) &&
    typeof quantity === 'number' &&
    Number.isFinite(quantity) &&
    quantity > 0
  )
}

/**
 * Body: { lines: [{ itemId, quantity }] }. Nothing is saved yet; the response
 * lists each line with its item name and stock unit.
 */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest('Body must be JSON')
  }

  const lines = (body as { lines?: unknown } | null)?.lines
  if (!Array.isArray(lines) || lines.length === 0) {
    return badRequest('Body must have a non-empty lines array')
  }
  if (!lines.every(isLine)) {
    return badRequest('Each line needs an integer itemId and a positive quantity')
  }

  const items = new Map((await listItems()).map((item) => [item.id, item]))
  const unknown = lines.filter((line) => !items.has(line.itemId))
  if (unknown.length > 0) {
    return badRequest(`Unknown itemId: ${unknown.map((line) => line.itemId).join(', ')}`)
  }

  const listed = lines.map((line) => {
    const item = items.get(line.itemId)!
    return `${item.name} ${line.quantity} ${item.stockUnit}`
  })
  return Response.json({ message: `Successfully restocked: ${listed.join(', ')}` })
}
