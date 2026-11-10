import { StockLevel, Transaction } from './types'

/**
 * Nets all transactions per item. Items appear in the order they are first
 * seen. Quantities are not clamped, so a negative result means the ledger is
 * missing an inflow (e.g. a sale with no recorded batch).
 */
export function estimateStock(transactions: Transaction[]): StockLevel[] {
  const totals = new Map<string, number>()
  for (const { itemId, quantity } of transactions) {
    totals.set(itemId, (totals.get(itemId) ?? 0) + quantity)
  }
  return Array.from(totals, ([itemId, quantity]) => ({ itemId, quantity }))
}
