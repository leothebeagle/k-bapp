import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import RestockPage from '@/app/restock/RestockPage'
import { ItemStage, Unit } from '@/lib/shared/types'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))

afterEach(cleanup)

const data = {
  stock: [
    {
      summary: { item: 'beef-raw', total: '9.5 KG' },
      details: [{ lot: 'LT-22', starting: 14.5, balance: 9.5, created: '2026-11-11', expires: '2026-11-15' }],
    },
  ],
  lots: [
    {
      id: 22,
      code: 'LT-22',
      itemId: 1,
      startingQuantity: 14.5,
      balance: 9.5,
      createdAt: '2026-11-11T09:00:00.000Z',
      expiresAt: '2026-11-15T09:00:00.000Z',
      finishedAt: null,
      active: true,
    },
  ],
  transactions: [
    {
      id: 42,
      code: 'TX-42',
      lotId: 22,
      quantity: 14.5,
      type: 'restock' as const,
      timestamp: '2026-11-11T09:00:00.000Z',
    },
  ],
  items: [
    { id: 1, code: 'IT-1', name: 'beef-raw', stage: ItemStage.BASE_INPUT, stockUnit: Unit.KG, shelfLifeDays: 4 },
  ],
}

function sectionRows(title: string) {
  const section = screen.getByRole('heading', { name: title }).closest('section')!
  const [, ...bodyRows] = within(section).getAllByRole('row')
  return bodyRows.map((row) => within(row).getAllByRole('cell').map((td) => td.textContent))
}

test('renders the four tables and the restock form from props, without fetching', () => {
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  render(<RestockPage {...data} />)
  vi.unstubAllGlobals()

  expect(fetchMock).not.toHaveBeenCalled()
  expect(sectionRows('Stock')).toEqual([['▸', 'beef-raw', '9.5 KG']])
  expect(sectionRows('Lots')).toEqual([
    ['22', 'LT-22', '1', '14.5', '9.5', '2026-11-11T09:00:00.000Z', '2026-11-15T09:00:00.000Z', '', 'true'],
  ])
  expect(sectionRows('Transactions')).toEqual([
    ['42', 'TX-42', '22', '14.5', 'restock', '2026-11-11T09:00:00.000Z'],
  ])
  expect(sectionRows('Items')).toEqual([['1', 'IT-1', 'beef-raw', 'BASE_INPUT', 'KG', '4']])

  // The form's item dropdowns come from the same items prop.
  expect(screen.getAllByRole('option', { name: 'beef-raw' })).toHaveLength(3)
})
