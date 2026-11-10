import { describe, expect, test } from 'vitest'
import { checkPar } from '@/lib/checkPar'
import { estimateStock } from '@/lib/estimateStock'
import { items, parLevels, transactions } from '@/lib/fixtures'
import { generateOrderList } from '@/lib/generateOrderList'
import { ItemStage, Unit } from '@/lib/types'

describe('generateOrderList', () => {
  test('lists every non-good fixture item, critical first', () => {
    const orders = generateOrderList(checkPar(estimateStock(transactions), parLevels), items)
    const ids = orders.map((o) => o.item.id)

    expect(orders).toHaveLength(30)
    expect(ids).not.toContain('raw-beef')
    expect(ids).not.toContain('soy-sauce')
    expect(orders[0]).toEqual({
      item: { id: 'raw-chicken', name: 'raw chicken', stage: ItemStage.BASE_INPUT, unit: Unit.KG },
      reason: 'Critical: below 50% of par',
    })
    expect(orders[29]).toEqual({
      item: { id: 'beef-marinade', name: 'beef marinade', stage: ItemStage.INTERMEDIARY, unit: Unit.LITER },
      reason: 'Low: below par',
    })
  })

  test('skips good statuses and unknown item ids', () => {
    const orders = generateOrderList(
      [
        { itemId: 'raw-beef', status: 'good' },
        { itemId: 'beef-marinade', status: 'low' },
        { itemId: 'eggs', status: 'critical' },
        { itemId: 'not-an-item', status: 'critical' },
      ],
      items,
    )

    expect(orders).toEqual([
      {
        item: { id: 'eggs', name: 'eggs', stage: ItemStage.BASE_INPUT, unit: Unit.UNIT },
        reason: 'Critical: below 50% of par',
      },
      {
        item: { id: 'beef-marinade', name: 'beef marinade', stage: ItemStage.INTERMEDIARY, unit: Unit.LITER },
        reason: 'Low: below par',
      },
    ])
  })
})
