export enum ItemStage {
  BASE_INPUT = 'BASE_INPUT',
  INTERMEDIARY = 'INTERMEDIARY',
  PRODUCTION_READY = 'PRODUCTION_READY',
  FINAL_PRODUCT = 'FINAL_PRODUCT',
}

export enum Unit {
  KG = 'KG',
  LITER = 'LITER',
  UNIT = 'UNIT',
  PORTION = 'PORTION',
  ROLL = 'ROLL',
  BATCH = 'BATCH',
}

export type Item = {
  /** Assigned by the database. */
  id: number
  /** Readable code derived from id by the database, e.g. "IT-1". */
  code: string
  name: string
  stage: ItemStage
  /** Stock unit. All lots and transactions for this item are counted in this unit. */
  stockUnit: Unit
  shelfLifeDays: number
}

export type Lot = {
  /** Assigned by the database. */
  id: number
  /** Readable code derived from id by the database, e.g. "LT-1". */
  code: string
  itemId: number
  /** Quantity the lot started with, in the item's stock unit. Set on creation. */
  startingQuantity: number
  /** Current quantity in the item's stock unit. Not calculated by the database. */
  balance: number
  /** ISO 8601 timestamp. */
  createdAt: string
  /** ISO 8601 timestamp. */
  expiresAt: string
  /** ISO 8601 timestamp, or null while the lot is active. */
  finishedAt: string | null
  /** Whether the lot is still in use. A plain column, not derived from finishedAt. */
  active: boolean
}

export type TransactionType = 'restock' | 'batch_made' | 'consumed' | 'adjustment' | 'sale'

export type Transaction = {
  /** Assigned by the database. */
  id: number
  /** Readable code derived from id by the database, e.g. "TX-1". */
  code: string
  lotId: number
  /** Positive adds, negative subtracts. */
  quantity: number
  type: TransactionType
  /** ISO 8601 timestamp. */
  timestamp: string
  performedBy?: string
  notes?: string
}

export type StockEntry = {
  summary: { item: string; total: string }
  /** lot is the lot's readable code, e.g. "LT-1". */
  details: { lot: string; starting: number; balance: number; created: string; expires: string }[]
}
