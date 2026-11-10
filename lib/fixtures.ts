import { Item, ItemStage, ParLevel, Transaction, Unit } from './types'

const { BASE_INPUT, INTERMEDIARY, PRODUCTION_READY, FINAL_PRODUCT } = ItemStage

export const items: Item[] = [
  // BASE_INPUT
  { id: 'raw-beef', name: 'raw beef', stage: BASE_INPUT, unit: Unit.KG },
  { id: 'raw-chicken', name: 'raw chicken', stage: BASE_INPUT, unit: Unit.KG },
  { id: 'canned-tuna', name: 'canned tuna', stage: BASE_INPUT, unit: Unit.UNIT },
  { id: 'raw-rice', name: 'raw rice', stage: BASE_INPUT, unit: Unit.KG },
  { id: 'raw-spinach', name: 'raw spinach', stage: BASE_INPUT, unit: Unit.KG },
  { id: 'raw-carrots', name: 'raw carrots', stage: BASE_INPUT, unit: Unit.KG },
  { id: 'eggs', name: 'eggs', stage: BASE_INPUT, unit: Unit.UNIT },
  { id: 'nori-bulk', name: 'nori bulk', stage: BASE_INPUT, unit: Unit.UNIT },
  { id: 'soy-sauce', name: 'soy sauce', stage: BASE_INPUT, unit: Unit.LITER },
  { id: 'sesame-oil', name: 'sesame oil', stage: BASE_INPUT, unit: Unit.LITER },
  { id: 'sugar', name: 'sugar', stage: BASE_INPUT, unit: Unit.KG },
  { id: 'gochujang', name: 'gochujang', stage: BASE_INPUT, unit: Unit.KG },
  { id: 'garlic-cloves', name: 'garlic cloves', stage: BASE_INPUT, unit: Unit.KG },
  { id: 'ginger', name: 'ginger', stage: BASE_INPUT, unit: Unit.KG },
  { id: 'salt', name: 'salt', stage: BASE_INPUT, unit: Unit.KG },
  { id: 'pepper', name: 'pepper', stage: BASE_INPUT, unit: Unit.KG },
  { id: 'beef-powder', name: 'beef powder', stage: BASE_INPUT, unit: Unit.KG },

  // INTERMEDIARY
  { id: 'beef-marinade', name: 'beef marinade', stage: INTERMEDIARY, unit: Unit.LITER },
  { id: 'chicken-marinade', name: 'chicken marinade', stage: INTERMEDIARY, unit: Unit.LITER },

  // PRODUCTION_READY
  { id: 'marinated-cooked-beef', name: 'marinated cooked beef', stage: PRODUCTION_READY, unit: Unit.KG },
  { id: 'marinated-cooked-chicken', name: 'marinated cooked chicken', stage: PRODUCTION_READY, unit: Unit.KG },
  { id: 'tuna-filling', name: 'tuna filling', stage: PRODUCTION_READY, unit: Unit.KG },
  { id: 'marinated-cooked-rice', name: 'marinated cooked rice', stage: PRODUCTION_READY, unit: Unit.KG },
  { id: 'marinated-cooked-spinach', name: 'marinated cooked spinach', stage: PRODUCTION_READY, unit: Unit.KG },
  { id: 'cooked-shredded-carrots', name: 'cooked shredded carrots', stage: PRODUCTION_READY, unit: Unit.KG },
  { id: 'pickled-yellow-radish', name: 'pickled yellow radish', stage: PRODUCTION_READY, unit: Unit.KG },
  { id: 'crab-sticks', name: 'crab sticks', stage: PRODUCTION_READY, unit: Unit.UNIT },
  { id: 'cooked-tamago-eggs', name: 'cooked tamago eggs', stage: PRODUCTION_READY, unit: Unit.PORTION },
  { id: 'portioned-nori', name: 'portioned nori', stage: PRODUCTION_READY, unit: Unit.PORTION },

  // FINAL_PRODUCT
  { id: 'beef-kimbap', name: 'beef kimbap', stage: FINAL_PRODUCT, unit: Unit.ROLL },
  { id: 'spicy-chicken-kimbap', name: 'spicy chicken kimbap', stage: FINAL_PRODUCT, unit: Unit.ROLL },
  { id: 'tuna-kimbap', name: 'tuna kimbap', stage: FINAL_PRODUCT, unit: Unit.ROLL },
]

/** Minimum on-hand quantities for one service day plus a buffer. */
export const parLevels: ParLevel[] = [
  // BASE_INPUT
  { itemId: 'raw-beef', minQuantity: 10, unit: Unit.KG },
  { itemId: 'raw-chicken', minQuantity: 10, unit: Unit.KG },
  { itemId: 'canned-tuna', minQuantity: 24, unit: Unit.UNIT },
  { itemId: 'raw-rice', minQuantity: 20, unit: Unit.KG },
  { itemId: 'raw-spinach', minQuantity: 3, unit: Unit.KG },
  { itemId: 'raw-carrots', minQuantity: 4, unit: Unit.KG },
  { itemId: 'eggs', minQuantity: 60, unit: Unit.UNIT },
  { itemId: 'nori-bulk', minQuantity: 200, unit: Unit.UNIT },
  { itemId: 'soy-sauce', minQuantity: 5, unit: Unit.LITER },
  { itemId: 'sesame-oil', minQuantity: 2, unit: Unit.LITER },
  { itemId: 'sugar', minQuantity: 3, unit: Unit.KG },
  { itemId: 'gochujang', minQuantity: 2, unit: Unit.KG },
  { itemId: 'garlic-cloves', minQuantity: 1, unit: Unit.KG },
  { itemId: 'ginger', minQuantity: 0.5, unit: Unit.KG },
  { itemId: 'salt', minQuantity: 1, unit: Unit.KG },
  { itemId: 'pepper', minQuantity: 0.25, unit: Unit.KG },
  { itemId: 'beef-powder', minQuantity: 0.5, unit: Unit.KG },

  // INTERMEDIARY
  { itemId: 'beef-marinade', minQuantity: 6, unit: Unit.LITER },
  { itemId: 'chicken-marinade', minQuantity: 6, unit: Unit.LITER },

  // PRODUCTION_READY
  { itemId: 'marinated-cooked-beef', minQuantity: 4, unit: Unit.KG },
  { itemId: 'marinated-cooked-chicken', minQuantity: 4, unit: Unit.KG },
  { itemId: 'tuna-filling', minQuantity: 2, unit: Unit.KG },
  { itemId: 'marinated-cooked-rice', minQuantity: 12, unit: Unit.KG },
  { itemId: 'marinated-cooked-spinach', minQuantity: 1.5, unit: Unit.KG },
  { itemId: 'cooked-shredded-carrots', minQuantity: 1.5, unit: Unit.KG },
  { itemId: 'pickled-yellow-radish', minQuantity: 2, unit: Unit.KG },
  { itemId: 'crab-sticks', minQuantity: 50, unit: Unit.UNIT },
  { itemId: 'cooked-tamago-eggs', minQuantity: 60, unit: Unit.PORTION },
  { itemId: 'portioned-nori', minQuantity: 80, unit: Unit.PORTION },

  // FINAL_PRODUCT
  { itemId: 'beef-kimbap', minQuantity: 30, unit: Unit.ROLL },
  { itemId: 'spicy-chicken-kimbap', minQuantity: 30, unit: Unit.ROLL },
  { itemId: 'tuna-kimbap', minQuantity: 20, unit: Unit.ROLL },
]

export const transactions: Transaction[] = [
  // One supplier delivery covering two items (one transaction per item).
  {
    id: 'txn-001',
    itemId: 'raw-beef',
    quantity: 15,
    type: 'delivery',
    timestamp: '2026-11-09T07:30:00.000Z',
    notes: 'Morning supplier delivery',
  },
  {
    id: 'txn-002',
    itemId: 'soy-sauce',
    quantity: 6,
    type: 'delivery',
    timestamp: '2026-11-09T07:30:00.000Z',
    notes: 'Morning supplier delivery',
  },
  {
    id: 'txn-003',
    itemId: 'beef-marinade',
    quantity: 4,
    type: 'batch_made',
    timestamp: '2026-11-09T09:00:00.000Z',
    notes: 'Prepped one 4 L batch of beef marinade',
  },
  {
    id: 'txn-004',
    itemId: 'beef-kimbap',
    quantity: -10,
    type: 'sale',
    timestamp: '2026-11-09T12:15:00.000Z',
    notes: 'Lunch service',
  },
]
