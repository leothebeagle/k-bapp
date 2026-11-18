import { describe, expect, it } from 'vitest'
import { aggregateFormItems, rowsMissingItem, rowsMissingQuantity } from '@/lib/restock'

const BEEF = 1
const SOY = 2

describe('aggregateFormItems', () => {
  it('combines rows with the same item, adding quantities', () => {
    expect(
      aggregateFormItems([
        { itemId: BEEF, quantity: 5 },
        { itemId: BEEF, quantity: 10 },
      ]),
    ).toEqual([{ itemId: BEEF, quantity: 15 }])
  })

  it('keeps different items separate, in first-appearance order', () => {
    expect(
      aggregateFormItems([
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
      aggregateFormItems([
        { itemId: null, quantity: null },
        { itemId: BEEF, quantity: 5 },
        { itemId: null, quantity: 3 },
      ]),
    ).toEqual([{ itemId: BEEF, quantity: 5 }])
    expect(aggregateFormItems([{ itemId: null, quantity: null }])).toEqual([])
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

describe('rowsMissingItem', () => {
  it('returns 1-based numbers of rows with a quantity but no item', () => {
    expect(
      rowsMissingItem([
        { itemId: BEEF, quantity: 5 },
        { itemId: null, quantity: 2 },
        { itemId: null, quantity: null },
        { itemId: SOY, quantity: null },
        { itemId: null, quantity: 0.5 },
      ]),
    ).toEqual([2, 5])
  })

  it('returns nothing when every row is empty or complete', () => {
    expect(
      rowsMissingItem([
        { itemId: null, quantity: null },
        { itemId: BEEF, quantity: 5 },
      ]),
    ).toEqual([])
  })
})
