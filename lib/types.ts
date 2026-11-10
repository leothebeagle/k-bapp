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
  unit: Unit
  /** If true, this item is assembled on demand and par levels do not apply. */
  madeToOrder?: boolean
}

export type Lot = {
  id: string
  itemId: string
  vendorId?: string
  quantity: number
  unit: Unit
  purchasedAt: string
  expiresAt?: string
  notes?: string
}

export type TransactionType = 'restock' | 'batch_made' | 'adjustment' | 'sale'

export type Transaction = {
  id: string
  itemId: string
  /** Positive adds stock, negative subtracts it. */
  quantity: number
  /** Must match the item's stock unit. */
  unit: Unit
  type: TransactionType
  /** ISO 8601 timestamp. */
  timestamp: string
  notes: string
  /** Set when the transaction was recorded as part of a workflow run. */
  workflowRunId?: string
  /** Set when the transaction came from a specific workflow step. */
  workflowStepId?: string
  /** Name or user ID of who performed this transaction. */
  performedBy?: string
  lotId?: string
}

export type StockLevel = {
  itemId: string
  quantity: number
}

export type ParLevel = {
  itemId: string
  minQuantity: number
  unit: Unit
}

export type ParStatus = 'good' | 'low' | 'critical'

export type WorkflowTemplate = {
  id: string
  name: string
  description: string
}

export type WorkflowStep = {
  id: string
  workflowTemplateId: string
  /** Order within the template, starting at 1. */
  position: number
  instruction: string
  notes: string
}

export type WorkflowRun = {
  id: string
  workflowTemplateId: string
  /** ISO 8601 timestamp. */
  startedAt: string
  /** ISO 8601 timestamp, or null while the run is in progress. */
  completedAt: string | null
  notes: string
}
