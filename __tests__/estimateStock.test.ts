import { describe, expect, test } from 'vitest'
import { estimateStock } from '@/lib/estimateStock'
import { transactions } from '@/lib/fixtures'
import { Transaction } from '@/lib/types'

describe('estimateStock', () => {
  test('nets the fixture transactions per item', () => {
    expect(estimateStock(transactions)).toEqual([
      { itemId: '001', quantity: 15 },
      { itemId: '009', quantity: 6 },
      { itemId: '018', quantity: 4 },
      { itemId: '030', quantity: -10 },
    ])
  })

  test('returns an empty list for no transactions', () => {
    expect(estimateStock([])).toEqual([])
  })

  test('combines multiple transactions for the same item', () => {
    const extra: Transaction[] = [
      {
        id: 'txn-005',
        itemId: '001',
        quantity: -2.5,
        type: 'adjustment',
        timestamp: '2026-11-09T18:00:00.000Z',
        notes: 'Trimmed and discarded',
      },
      {
        id: 'txn-006',
        itemId: '030',
        quantity: 40,
        type: 'batch_made',
        timestamp: '2026-11-09T18:30:00.000Z',
        notes: 'Rolled for tomorrow',
      },
    ]
    expect(estimateStock([...transactions, ...extra])).toEqual([
      { itemId: '001', quantity: 12.5 },
      { itemId: '009', quantity: 6 },
      { itemId: '018', quantity: 4 },
      { itemId: '030', quantity: 30 },
    ])
  })
})
