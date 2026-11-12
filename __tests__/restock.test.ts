import { describe, expect, it } from 'vitest'
import { aggregateRestock, rowsMissingQuantity } from '@/lib/restock'

const BEEF = 1
const SOY = 2

describe('aggregateRestock', () => {
  it('combines rows with the same item, adding quantities', () => {
    expect(
      aggregateRestock([
        { itemId: BEEF, quantity: 5 },
        { itemId: BEEF, quantity: 10 },
      ]),
    ).toEqual([{ itemId: BEEF, quantity: 15 }])
  })

  it('keeps different items separate, in first-appearance order', () => {
    expect(
      aggregateRestock([
        { itemId: SOY, quantity: 2 },
        { itemId: BEEF, quantity: 5 },
        { itemId: SOY, quantity: 0.5 },
      ]),
    ).toEqual([
      { itemId: SOY, quantity: 2.5 },
      { itemId: BEEF, quantity: 5 },
    ])
  })

  it('drops empty rows', () => {
    expect(
      aggregateRestock([
        { itemId: null, quantity: null },
        { itemId: BEEF, quantity: 5 },
        { itemId: null, quantity: 3 },
      ]),
    ).toEqual([{ itemId: BEEF, quantity: 5 }])
    expect(aggregateRestock([{ itemId: null, quantity: null }])).toEqual([])
  })
})

describe('rowsMissingQuantity', () => {
  it('returns 1-based numbers of rows with an item but no quantity', () => {
    expect(
      rowsMissingQuantity([
        { itemId: BEEF, quantity: 5 },
        { itemId: SOY, quantity: null },
        { itemId: null, quantity: null },
        { itemId: BEEF, quantity: null },
      ]),
    ).toEqual([2, 4])
  })
})
