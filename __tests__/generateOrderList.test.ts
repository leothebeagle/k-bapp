import { describe, expect, test } from 'vitest'
import { checkPar } from '@/lib/checkPar'
import { estimateStock } from '@/lib/estimateStock'
import { items, parLevels, transactions } from '@/lib/fixtures'
import { generateOrderList } from '@/lib/generateOrderList'
import { ItemStage, Unit } from '@/lib/types'

describe('generateOrderList', () => {
  test('lists every non-good fixture item, critical first', () => {
    const orders = generateOrderList(checkPar(estimateStock(transactions), parLevels, items), items)
    const ids = orders.map((o) => o.item.id)

    expect(orders).toHaveLength(27)
    expect(ids).not.toContain('001')
    expect(ids).not.toContain('009')
    expect(orders[0]).toEqual({
      item: { id: '002', name: 'chicken-raw', stage: ItemStage.BASE_INPUT, unit: Unit.KG },
      reason: 'Critical: below 50% of par',
    })
    expect(orders[26]).toEqual({
      item: { id: '018', name: 'marinade-beef', stage: ItemStage.INTERMEDIARY, unit: Unit.LITER },
      reason: 'Low: below par',
    })
  })

  test('skips good statuses and unknown item ids', () => {
    const orders = generateOrderList(
      [
        { itemId: '001', status: 'good' },
        { itemId: '018', status: 'low' },
        { itemId: '007', status: 'critical' },
        { itemId: 'not-an-item', status: 'critical' },
      ],
      items,
    )

    expect(orders).toEqual([
      {
        item: { id: '007', name: 'eggs', stage: ItemStage.BASE_INPUT, unit: Unit.UNIT },
        reason: 'Critical: below 50% of par',
      },
      {
        item: { id: '018', name: 'marinade-beef', stage: ItemStage.INTERMEDIARY, unit: Unit.LITER },
        reason: 'Low: below par',
      },
    ])
  })
})
