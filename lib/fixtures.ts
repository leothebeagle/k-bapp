import { Item, ItemStage, ParLevel, Transaction, Unit } from './types'

const { BASE_INPUT, INTERMEDIARY, PRODUCTION_READY, FINAL_PRODUCT } = ItemStage

export const items: Item[] = [
  // BASE_INPUT
  { id: '001', name: 'beef-raw', stage: BASE_INPUT, unit: Unit.KG },
  { id: '002', name: 'chicken-raw', stage: BASE_INPUT, unit: Unit.KG },
  { id: '003', name: 'tuna-canned', stage: BASE_INPUT, unit: Unit.UNIT },
  { id: '004', name: 'rice-raw', stage: BASE_INPUT, unit: Unit.KG },
  { id: '005', name: 'spinach-raw', stage: BASE_INPUT, unit: Unit.KG },
  { id: '006', name: 'carrots-raw', stage: BASE_INPUT, unit: Unit.KG },
  { id: '007', name: 'eggs', stage: BASE_INPUT, unit: Unit.UNIT },
  { id: '008', name: 'nori-bulk', stage: BASE_INPUT, unit: Unit.UNIT },
  { id: '009', name: 'soy-sauce', stage: BASE_INPUT, unit: Unit.LITER },
  { id: '010', name: 'sesame-oil', stage: BASE_INPUT, unit: Unit.LITER },
  { id: '011', name: 'sugar', stage: BASE_INPUT, unit: Unit.KG },
  { id: '012', name: 'gochujang', stage: BASE_INPUT, unit: Unit.KG },
  { id: '013', name: 'garlic-cloves', stage: BASE_INPUT, unit: Unit.KG },
  { id: '014', name: 'ginger', stage: BASE_INPUT, unit: Unit.KG },
  { id: '015', name: 'salt', stage: BASE_INPUT, unit: Unit.KG },
  { id: '016', name: 'pepper', stage: BASE_INPUT, unit: Unit.KG },
  { id: '017', name: 'beef-powder', stage: BASE_INPUT, unit: Unit.KG },

  // INTERMEDIARY
  { id: '018', name: 'marinade-beef', stage: INTERMEDIARY, unit: Unit.LITER },
  { id: '019', name: 'marinade-chicken', stage: INTERMEDIARY, unit: Unit.LITER },

  // PRODUCTION_READY
  { id: '020', name: 'beef-cooked', stage: PRODUCTION_READY, unit: Unit.KG },
  { id: '021', name: 'chicken-cooked', stage: PRODUCTION_READY, unit: Unit.KG },
  { id: '022', name: 'tuna-filling', stage: PRODUCTION_READY, unit: Unit.KG },
  { id: '023', name: 'rice-cooked', stage: PRODUCTION_READY, unit: Unit.KG },
  { id: '024', name: 'spinach-cooked', stage: PRODUCTION_READY, unit: Unit.KG },
  { id: '025', name: 'carrots-cooked', stage: PRODUCTION_READY, unit: Unit.KG },
  { id: '026', name: 'radish-pickled', stage: PRODUCTION_READY, unit: Unit.KG },
  { id: '027', name: 'crabsticks', stage: PRODUCTION_READY, unit: Unit.UNIT },
  { id: '028', name: 'eggs-cooked', stage: PRODUCTION_READY, unit: Unit.PORTION },
  { id: '029', name: 'nori-portioned', stage: PRODUCTION_READY, unit: Unit.PORTION },

  // FINAL_PRODUCT
  { id: '030', name: 'kimbap-beef', stage: FINAL_PRODUCT, unit: Unit.ROLL, madeToOrder: true },
  { id: '031', name: 'kimbap-chicken-spicy', stage: FINAL_PRODUCT, unit: Unit.ROLL, madeToOrder: true },
  { id: '032', name: 'kimbap-tuna', stage: FINAL_PRODUCT, unit: Unit.ROLL, madeToOrder: true },
]

/** Minimum on-hand quantities for one service day plus a buffer. */
export const parLevels: ParLevel[] = [
  // BASE_INPUT
  { itemId: '001', minQuantity: 10, unit: Unit.KG },
  { itemId: '002', minQuantity: 10, unit: Unit.KG },
  { itemId: '003', minQuantity: 24, unit: Unit.UNIT },
  { itemId: '004', minQuantity: 20, unit: Unit.KG },
  { itemId: '005', minQuantity: 3, unit: Unit.KG },
  { itemId: '006', minQuantity: 4, unit: Unit.KG },
  { itemId: '007', minQuantity: 60, unit: Unit.UNIT },
  { itemId: '008', minQuantity: 200, unit: Unit.UNIT },
  { itemId: '009', minQuantity: 5, unit: Unit.LITER },
  { itemId: '010', minQuantity: 2, unit: Unit.LITER },
  { itemId: '011', minQuantity: 3, unit: Unit.KG },
  { itemId: '012', minQuantity: 2, unit: Unit.KG },
  { itemId: '013', minQuantity: 1, unit: Unit.KG },
  { itemId: '014', minQuantity: 0.5, unit: Unit.KG },
  { itemId: '015', minQuantity: 1, unit: Unit.KG },
  { itemId: '016', minQuantity: 0.25, unit: Unit.KG },
  { itemId: '017', minQuantity: 0.5, unit: Unit.KG },

  // INTERMEDIARY
  { itemId: '018', minQuantity: 6, unit: Unit.LITER },
  { itemId: '019', minQuantity: 6, unit: Unit.LITER },

  // PRODUCTION_READY
  { itemId: '020', minQuantity: 4, unit: Unit.KG },
  { itemId: '021', minQuantity: 4, unit: Unit.KG },
  { itemId: '022', minQuantity: 2, unit: Unit.KG },
  { itemId: '023', minQuantity: 12, unit: Unit.KG },
  { itemId: '024', minQuantity: 1.5, unit: Unit.KG },
  { itemId: '025', minQuantity: 1.5, unit: Unit.KG },
  { itemId: '026', minQuantity: 2, unit: Unit.KG },
  { itemId: '027', minQuantity: 50, unit: Unit.UNIT },
  { itemId: '028', minQuantity: 60, unit: Unit.PORTION },
  { itemId: '029', minQuantity: 80, unit: Unit.PORTION },

  // FINAL_PRODUCT
  { itemId: '030', minQuantity: 30, unit: Unit.ROLL },
  { itemId: '031', minQuantity: 30, unit: Unit.ROLL },
  { itemId: '032', minQuantity: 20, unit: Unit.ROLL },
]

export const transactions: Transaction[] = [
  // One supplier delivery covering two items (one transaction per item).
  {
    id: 'txn-001',
    itemId: '001',
    quantity: 15,
    type: 'restock',
    timestamp: '2026-11-09T07:30:00.000Z',
    notes: 'Morning supplier delivery',
  },
  {
    id: 'txn-002',
    itemId: '009',
    quantity: 6,
    type: 'restock',
    timestamp: '2026-11-09T07:30:00.000Z',
    notes: 'Morning supplier delivery',
  },
  {
    id: 'txn-003',
    itemId: '018',
    quantity: 4,
    type: 'batch_made',
    timestamp: '2026-11-09T09:00:00.000Z',
    notes: 'Prepped one 4 L batch of beef marinade',
  },
  {
    id: 'txn-004',
    itemId: '030',
    quantity: -10,
    type: 'sale',
    timestamp: '2026-11-09T12:15:00.000Z',
    notes: 'Lunch service',
  },
]
