import { query } from './db'
import type { Item, ItemStage, Lot, Transaction, TransactionType, Unit } from './types'

// Numeric columns are cast to float8 in SQL so both drivers (pg and PGlite)
// return JS numbers; pg returns `numeric` as a string. IDs are bigint, which
// pg also returns as a string, so they go through Number() here. Timestamps
// come back as Date objects and are converted to ISO strings here.

/** A bigint column as returned by either driver. */
type BigintValue = number | string

function toIso(value: Date | string): string {
  return new Date(value).toISOString()
}

/** "YYYY-MM-DD" in UTC, matching the UTC formatting used in app/stock/format.ts. */
function toDate(value: Date | string): string {
  return toIso(value).slice(0, 10)
}

type ItemRow = {
  id: BigintValue
  code: string
  name: string
  stage: ItemStage
  stock_unit: Unit
  shelf_life_days: number
}

export async function listItems(): Promise<Item[]> {
  const rows = await query<ItemRow>(
    `SELECT id, code, name, stage, stock_unit, shelf_life_days
     FROM items
     ORDER BY id`,
  )
  return rows.map((r) => ({
    id: Number(r.id),
    code: r.code,
    name: r.name,
    stage: r.stage,
    stockUnit: r.stock_unit,
    shelfLifeDays: r.shelf_life_days,
  }))
}

type LotRow = {
  id: BigintValue
  code: string
  item_id: BigintValue
  starting_quantity: number
  balance: number
  created_at: Date
  expires_at: Date
  finished_at: Date | null
  active: boolean
}

export async function listLots(): Promise<Lot[]> {
  const rows = await query<LotRow>(
    `SELECT id, code, item_id, starting_quantity::float8 AS starting_quantity,
            balance::float8 AS balance, created_at, expires_at, finished_at, active
     FROM lots
     ORDER BY created_at, id`,
  )
  return rows.map((r) => ({
    id: Number(r.id),
    code: r.code,
    itemId: Number(r.item_id),
    startingQuantity: Number(r.starting_quantity),
    balance: Number(r.balance),
    createdAt: toIso(r.created_at),
    expiresAt: toIso(r.expires_at),
    finishedAt: r.finished_at === null ? null : toIso(r.finished_at),
    active: r.active,
  }))
}

type TransactionRow = {
  id: BigintValue
  code: string
  lot_id: BigintValue
  quantity: number
  type: TransactionType
  timestamp: Date
  performed_by: string | null
  notes: string | null
}

export async function listTransactions(): Promise<Transaction[]> {
  const rows = await query<TransactionRow>(
    `SELECT id, code, lot_id, quantity::float8 AS quantity, type, timestamp, performed_by, notes
     FROM transactions
     ORDER BY timestamp, id`,
  )
  return rows.map((r) => ({
    id: Number(r.id),
    code: r.code,
    lotId: Number(r.lot_id),
    quantity: Number(r.quantity),
    type: r.type,
    timestamp: toIso(r.timestamp),
    // Optional in the type, so omit rather than send null.
    ...(r.performed_by !== null && { performedBy: r.performed_by }),
    ...(r.notes !== null && { notes: r.notes }),
  }))
}

export type StockEntry = {
  summary: { item: string; total: string }
  /** lot is the lot's readable code, e.g. "LT-1". */
  details: { lot: string; starting: number; balance: number; created: string; expires: string }[]
}

type StockRow = {
  item_id: BigintValue
  item_name: string
  stock_unit: Unit
  lot_code: string
  starting_quantity: number
  balance: number
  created_at: Date
  expires_at: Date
}

/** One entry per item that has active lots, with those lots as details. */
export async function getStock(): Promise<StockEntry[]> {
  const rows = await query<StockRow>(
    `SELECT i.id AS item_id, i.name AS item_name, i.stock_unit,
            l.code AS lot_code, l.starting_quantity::float8 AS starting_quantity,
            l.balance::float8 AS balance, l.created_at, l.expires_at
     FROM lots l
     JOIN items i ON i.id = l.item_id
     WHERE l.active = true
     ORDER BY i.name, l.created_at, l.id`,
  )

  const byItem = new Map<number, { name: string; unit: Unit; lots: StockRow[] }>()
  for (const row of rows) {
    const itemId = Number(row.item_id)
    let group = byItem.get(itemId)
    if (!group) {
      group = { name: row.item_name, unit: row.stock_unit, lots: [] }
      byItem.set(itemId, group)
    }
    group.lots.push(row)
  }

  return Array.from(byItem.values(), ({ name, unit, lots }) => {
    const sum = lots.reduce((acc, l) => acc + Number(l.balance), 0)
    // Round away float noise from adding decimals (e.g. 0.1 + 0.2).
    const total = Math.round(sum * 1e6) / 1e6
    return {
      summary: { item: name, total: `${total} ${unit}` },
      details: lots.map((l) => ({
        lot: l.lot_code,
        starting: Number(l.starting_quantity),
        balance: Number(l.balance),
        created: toDate(l.created_at),
        expires: toDate(l.expires_at),
      })),
    }
  })
}
