import { ParLevel, ParStatus, StockLevel } from './types'

/**
 * Reports a status for every par level, in par-level order. Items with no
 * stock entry count as 0. Exactly at par is 'good'; exactly 50% is 'low'.
 */
export function checkPar(
  stockLevels: StockLevel[],
  parLevels: ParLevel[],
): { itemId: string; status: ParStatus }[] {
  const stock = new Map(stockLevels.map((s) => [s.itemId, s.quantity]))
  return parLevels.map(({ itemId, minQuantity }) => {
    const quantity = stock.get(itemId) ?? 0
    let status: ParStatus = 'good'
    if (quantity < minQuantity * 0.5) status = 'critical'
    else if (quantity < minQuantity) status = 'low'
    return { itemId, status }
  })
}
