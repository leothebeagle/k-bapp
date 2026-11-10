import { Item, ParLevel, ParStatus, StockLevel } from './types'

/**
 * Reports a status for every par level, in par-level order. Items with no
 * stock entry count as 0. Exactly at par is 'good'; exactly 50% is 'low'.
 * Items marked madeToOrder are skipped, since par levels do not apply to them.
 */
export function checkPar(
  stockLevels: StockLevel[],
  parLevels: ParLevel[],
  items: Item[],
): { itemId: string; status: ParStatus }[] {
  const stock = new Map(stockLevels.map((s) => [s.itemId, s.quantity]))
  const madeToOrder = new Set(items.filter((i) => i.madeToOrder).map((i) => i.id))
  return parLevels
    .filter(({ itemId }) => !madeToOrder.has(itemId))
    .map(({ itemId, minQuantity }) => {
      const quantity = stock.get(itemId) ?? 0
      let status: ParStatus = 'good'
      if (quantity < minQuantity * 0.5) status = 'critical'
      else if (quantity < minQuantity) status = 'low'
      return { itemId, status }
    })
}
