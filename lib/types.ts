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
  id: string
  name: string
  stage: ItemStage
  /** Stock unit. All lots and transactions for this item are counted in this unit. */
  stockUnit: Unit
  shelfLifeDays: number
}

export type Lot = {
  id: string
  itemId: string
  /** ISO 8601 timestamp. */
  createdAt: string
  /** ISO 8601 timestamp. */
  expiresAt: string
  /** ISO 8601 timestamp, or null while the lot is active. */
  finishedAt: string | null
}

export type TransactionType = 'restock' | 'batch_made' | 'consumed' | 'adjustment' | 'sale'

export type Transaction = {
  id: string
  lotId: string
  /** Positive adds, negative subtracts. */
  quantity: number
  type: TransactionType
  /** ISO 8601 timestamp. */
  timestamp: string
  performedBy?: string
  notes?: string
}
