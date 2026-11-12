import { Item, ItemStage, Lot, Transaction, Unit } from './types';

const { BASE_INPUT, INTERMEDIARY } = ItemStage;

export const items: Item[] = [
  {
    id: '001',
    name: 'beef-raw',
    stage: BASE_INPUT,
    stockUnit: Unit.KG,
    shelfLifeDays: 4,
  },
  {
    id: '002',
    name: 'soy-sauce',
    stage: BASE_INPUT,
    stockUnit: Unit.LITER,
    shelfLifeDays: 365,
  },
  {
    id: '003',
    name: 'sugar',
    stage: BASE_INPUT,
    stockUnit: Unit.KG,
    shelfLifeDays: 180,
  },
  {
    id: '004',
    name: 'marinade-beef',
    stage: INTERMEDIARY,
    stockUnit: Unit.LITER,
    shelfLifeDays: 5,
  },
  {
    id: '005',
    name: 'beef-marinated',
    stage: INTERMEDIARY,
    stockUnit: Unit.KG,
    shelfLifeDays: 4,
  },
  {
    id: '006',
    name: 'sesame oil',
    stage: INTERMEDIARY,
    stockUnit: Unit.LITER,
    shelfLifeDays: 365,
  },
];

export const lots: Lot[] = [
  {
    id: 'L9',
    itemId: '001',
    createdAt: '2026-11-08T09:00:00Z',
    expiresAt: '2026-11-12T09:00:00Z',
    finishedAt: '2026-11-12T10:00:00Z',
  },
  {
    id: 'L20',
    itemId: '003',
    createdAt: '2026-11-11T09:00:00Z',
    expiresAt: '2027-05-10T09:00:00Z',
    finishedAt: null,
  },
  {
    id: 'L21',
    itemId: '002',
    createdAt: '2026-11-11T09:00:00Z',
    expiresAt: '2027-11-11T09:00:00Z',
    finishedAt: null,
  },
  {
    id: 'L22',
    itemId: '001',
    createdAt: '2026-11-11T09:00:00Z',
    expiresAt: '2026-11-15T09:00:00Z',
    finishedAt: null,
  },
  {
    id: 'L23',
    itemId: '004',
    createdAt: '2026-11-11T14:00:00Z',
    expiresAt: '2026-11-16T14:00:00Z',
    finishedAt: '2026-11-13T10:00:00Z',
  },
  {
    id: 'L24',
    itemId: '005',
    createdAt: '2026-11-13T10:00:00Z',
    expiresAt: '2026-11-15T10:00:00Z',
    finishedAt: null,
  },
];

export const transactions: Transaction[] = [
  {
    id: 'T39',
    lotId: 'L9',
    quantity: 1.5,
    type: 'restock',
    timestamp: '2026-11-08T09:00:00Z',
  },
  {
    id: 'T40',
    lotId: 'L20',
    quantity: 4,
    type: 'restock',
    timestamp: '2026-11-11T09:00:00Z',
    notes: 'Supply run',
  },
  {
    id: 'T41',
    lotId: 'L21',
    quantity: 1.8,
    type: 'restock',
    timestamp: '2026-11-11T09:00:00Z',
    notes: 'Supply run',
  },
  {
    id: 'T42',
    lotId: 'L22',
    quantity: 14.5,
    type: 'restock',
    timestamp: '2026-11-11T09:00:00Z',
    notes: 'Supply run',
  },
  {
    id: 'T43',
    lotId: 'L21',
    quantity: -0.5,
    type: 'consumed',
    timestamp: '2026-11-11T14:00:00Z',
    notes: 'Beef marinade',
  },
  {
    id: 'T44',
    lotId: 'L20',
    quantity: -0.2,
    type: 'consumed',
    timestamp: '2026-11-11T14:00:00Z',
    notes: 'Beef marinade',
  },
  {
    id: 'T45',
    lotId: 'L23',
    quantity: 0.6,
    type: 'batch_made',
    timestamp: '2026-11-11T14:00:00Z',
    notes: 'Beef marinade',
  },
  {
    id: 'T46',
    lotId: 'L9',
    quantity: -1.5,
    type: 'adjustment',
    timestamp: '2026-11-12T10:00:00Z',
    notes: 'Expired, discarded',
  },
  {
    id: 'T47',
    lotId: 'L22',
    quantity: -5,
    type: 'consumed',
    timestamp: '2026-11-13T10:00:00Z',
    notes: 'Marinated beef',
  },
  {
    id: 'T48',
    lotId: 'L23',
    quantity: -0.6,
    type: 'consumed',
    timestamp: '2026-11-13T10:00:00Z',
    notes: 'Marinated beef',
  },
  {
    id: 'T49',
    lotId: 'L24',
    quantity: 5,
    type: 'batch_made',
    timestamp: '2026-11-13T10:00:00Z',
    notes: 'Marinated beef',
  },
];

export type StockLot = {
  lotId: string;
  balance: number;
  /** ISO 8601 timestamp. */
  createdAt: string;
  /** ISO 8601 timestamp. */
  expiresAt: string;
};

export type StockEntry = {
  itemId: string;
  total: number;
  lots: StockLot[];
};

/** Hardcoded on-hand stock. Matches the lots and transactions above. */
export const stock: StockEntry[] = [
  {
    itemId: '001',
    total: 9.5,
    lots: [
      {
        lotId: 'L22',
        balance: 9.5,
        createdAt: '2026-11-11T09:00:00Z',
        expiresAt: '2026-11-15T09:00:00Z',
      },
    ],
  },
  {
    itemId: '005',
    total: 5,
    lots: [
      {
        lotId: 'L24',
        balance: 5,
        createdAt: '2026-11-13T10:00:00Z',
        expiresAt: '2026-11-15T10:00:00Z',
      },
    ],
  },
  {
    itemId: '002',
    total: 1.3,
    lots: [
      {
        lotId: 'L21',
        balance: 1.3,
        createdAt: '2026-11-11T09:00:00Z',
        expiresAt: '2027-11-11T09:00:00Z',
      },
    ],
  },
  {
    itemId: '003',
    total: 3.8,
    lots: [
      {
        lotId: 'L20',
        balance: 3.8,
        createdAt: '2026-11-11T09:00:00Z',
        expiresAt: '2027-05-10T09:00:00Z',
      },
    ],
  },
];

// transactions should include the data of "consumed by" so that in the future we can track which
// workflow step in which workflow session consumed it.
