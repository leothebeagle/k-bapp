import { query } from '../db/db'
import type { Lot } from '../../shared/types'
import { toIso, type BigintValue } from './shared'

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
