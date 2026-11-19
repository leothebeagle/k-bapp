import { query } from '../db/db'
import type { StockEntry, Unit } from '../../shared/types'
import { toDate, type BigintValue } from './shared'

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
