/** One raw form row, possibly empty. null means nothing has been chosen yet. */
export type RestockRow = {
  itemId: number | null
  quantity: number | null
}

/**
 * One item of a restock request with its total quantity, in the item's stock
 * unit, after form rows with the same item are combined.
 */
export type RestockFormItem = {
  itemId: number
  quantity: number
}

/**
 * Combines rows with the same item into one restock form item, adding their
 * quantities. Rows missing an item or a quantity are dropped. Restock form
 * items keep the order in which each item first appears.
 */
export function aggregateFormItems(rows: RestockRow[]): RestockFormItem[] {
  const totals = new Map<number, number>()
  for (const { itemId, quantity } of rows) {
    if (itemId === null || quantity === null) continue
    totals.set(itemId, (totals.get(itemId) ?? 0) + quantity)
  }
  return Array.from(totals, ([itemId, quantity]) => ({ itemId, quantity }))
}

/** 1-based numbers of rows that have an item chosen but no quantity. */
export function rowsMissingQuantity(rows: RestockRow[]): number[] {
  return rows.flatMap((row, i) => (row.itemId !== null && row.quantity === null ? [i + 1] : []))
}

/** 1-based numbers of rows that have a quantity chosen but no item. */
export function rowsMissingItem(rows: RestockRow[]): number[] {
  return rows.flatMap((row, i) => (row.itemId === null && row.quantity !== null ? [i + 1] : []))
}
