import { query } from '../db/db'
import type { Transaction, TransactionType } from '../../shared/types'
import { toIso, type BigintValue } from './shared'

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
