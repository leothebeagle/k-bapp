import { Item } from './types'

const REASONS: Record<string, string> = {
  critical: 'Critical: below 50% of par',
  low: 'Low: below par',
}

const PRIORITY: Record<string, number> = { critical: 0, low: 1 }

/**
 * Lists every item whose status is 'low' or 'critical', critical first,
 * otherwise keeping report order. Report entries for unknown item ids are
 * skipped.
 */
export function generateOrderList(
  parReport: { itemId: string; status: string }[],
  items: Item[],
): { item: Item; reason: string }[] {
  const byId = new Map(items.map((item) => [item.id, item]))
  return parReport
    .filter((entry) => Object.hasOwn(REASONS, entry.status) && byId.has(entry.itemId))
    .sort((a, b) => PRIORITY[a.status] - PRIORITY[b.status])
    .map((entry) => ({ item: byId.get(entry.itemId)!, reason: REASONS[entry.status] }))
}
