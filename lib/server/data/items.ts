import { query } from '../db/db'
import type { Item, ItemStage, Unit } from '../../shared/types'
import type { BigintValue } from './shared'

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
