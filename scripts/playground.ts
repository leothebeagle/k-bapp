import { items, parLevels, transactions } from '@/lib/fixtures'
import { estimateStock } from '@/lib/estimateStock'
import { checkPar } from '@/lib/checkPar'
import { generateOrderList } from '@/lib/generateOrderList'
import type { ParStatus } from '@/lib/types'

const itemsById = new Map(items.map((item) => [item.id, item]))
const nameOf = (id: string) => itemsById.get(id)?.name ?? `unknown (${id})`

function heading(title: string) {
  console.log(`\n=== ${title} ===`)
}

// CURRENT STOCK
const stock = estimateStock(transactions)
heading('CURRENT STOCK')
const nonZero = stock.filter((s) => s.quantity !== 0)
if (nonZero.length === 0) console.log('  (none)')
for (const { itemId, quantity } of nonZero) {
  const unit = itemsById.get(itemId)?.unit ?? ''
  console.log(`  ${nameOf(itemId).padEnd(24)} ${quantity} ${unit}`)
}

// PAR STATUS
const parReport = checkPar(stock, parLevels, items)
heading('PAR STATUS')
const groups: ParStatus[] = ['good', 'low', 'critical']
for (const status of groups) {
  const names = parReport.filter((r) => r.status === status).map((r) => nameOf(r.itemId))
  console.log(`  ${status.toUpperCase()} (${names.length})`)
  for (const name of names) console.log(`    - ${name}`)
}

// ORDER LIST
const orderList = generateOrderList(parReport, items)
heading('ORDER LIST')
if (orderList.length === 0) console.log('  (nothing to order)')
for (const { item, reason } of orderList) {
  console.log(`  ${item.name.padEnd(24)} ${reason}`)
}
