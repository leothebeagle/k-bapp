import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import StockPage from '@/app/stock/StockPage'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const responses: Record<string, unknown> = {
  '/api/stock': [
    {
      summary: { item: 'beef-raw', total: '9.5 KG' },
      details: [{ lot: 'L22', balance: 9.5, created: '2026-11-11', expires: '2026-11-15' }],
    },
  ],
  '/api/lots': [
    {
      id: 'L22',
      itemId: '001',
      balance: 9.5,
      createdAt: '2026-11-11T09:00:00.000Z',
      expiresAt: '2026-11-15T09:00:00.000Z',
      finishedAt: null,
    },
  ],
  '/api/transactions': [
    { id: 'T42', lotId: 'L22', quantity: 14.5, type: 'restock', timestamp: '2026-11-11T09:00:00.000Z' },
  ],
  '/api/items': [{ id: '001', name: 'beef-raw', stage: 'BASE_INPUT', stockUnit: 'KG', shelfLifeDays: 4 }],
}

function stubFetch(failUrl?: string) {
  const fetchMock = vi.fn(async (url: string) =>
    url === failUrl
      ? new Response('boom', { status: 500 })
      : Response.json(responses[url] ?? null),
  )
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function sectionRows(title: string) {
  const section = screen.getByRole('heading', { name: title }).closest('section')!
  const [, ...bodyRows] = within(section).getAllByRole('row')
  return bodyRows.map((row) => within(row).getAllByRole('cell').map((td) => td.textContent))
}

test('shows Loading… then renders the rows returned by each endpoint', async () => {
  const fetchMock = stubFetch()
  render(<StockPage />)

  expect(screen.getByText('Loading…')).toBeTruthy()

  await screen.findByRole('heading', { name: 'Stock' })
  expect(screen.queryByText('Loading…')).toBeNull()

  expect(fetchMock.mock.calls.map(([url]) => url).sort()).toEqual([
    '/api/items',
    '/api/lots',
    '/api/stock',
    '/api/transactions',
  ])

  expect(sectionRows('Stock')).toEqual([['▸', 'beef-raw', '9.5 KG']])
  expect(sectionRows('Lots')).toEqual([
    ['L22', '001', '9.5', '2026-11-11T09:00:00.000Z', '2026-11-15T09:00:00.000Z', ''],
  ])
  expect(sectionRows('Transactions')).toEqual([
    ['T42', 'L22', '14.5', 'restock', '2026-11-11T09:00:00.000Z'],
  ])
  expect(sectionRows('Items')).toEqual([['001', 'beef-raw', 'BASE_INPUT', 'KG', '4']])
})

test('shows an error message when a request fails', async () => {
  stubFetch('/api/lots')
  render(<StockPage />)

  const alert = await screen.findByRole('alert')
  expect(alert.textContent).toContain('/api/lots responded 500')
  expect(screen.queryByText('Loading…')).toBeNull()
  expect(screen.queryByRole('table')).toBeNull()
})
