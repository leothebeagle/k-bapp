import { afterEach, expect, test } from 'vitest'
import { cleanup, fireEvent, render, within } from '@testing-library/react'
import StockTable from '@/app/stock/StockTable'

afterEach(cleanup)

const rows = [
  {
    summary: { item: 'beef-raw', total: '16 KG' },
    details: [
      { lot: 'L-9', balance: 1.5, created: 'Nov 8', expires: 'Nov 12' },
      { lot: 'L-22', balance: 14.5, created: 'Nov 11', expires: 'Nov 15' },
    ],
  },
  {
    summary: { item: 'soy-sauce', total: '1.8 LITER' },
    details: [{ lot: 'L-21', balance: 1.8, created: 'Nov 11', expires: 'Nov 2027' }],
  },
]

function cellTexts(row: HTMLElement) {
  return within(row).getAllByRole('cell').map((td) => td.textContent)
}

test('renders one summary row per entry with headers from the first summary’s keys', () => {
  const { getByRole } = render(<StockTable rows={rows} />)
  const table = getByRole('table')

  const headers = within(table).getAllByRole('columnheader').map((th) => th.textContent)
  expect(headers).toEqual(['', 'item', 'total'])

  const [, ...bodyRows] = within(table).getAllByRole('row')
  expect(bodyRows).toHaveLength(2)
  expect(cellTexts(bodyRows[0])).toEqual(['▸', 'beef-raw', '16 KG'])
  expect(cellTexts(bodyRows[1])).toEqual(['▸', 'soy-sauce', '1.8 LITER'])
})

test('details are hidden at first', () => {
  const { queryByText } = render(<StockTable rows={rows} />)
  for (const lot of ['L-9', 'L-22', 'L-21']) {
    expect(queryByText(lot)).toBeNull()
  }
})

test('clicking a summary row shows only its details, and clicking again hides them', () => {
  const { getByText, queryByText, getAllByRole } = render(<StockTable rows={rows} />)

  fireEvent.click(getByText('beef-raw'))

  expect(getAllByRole('table')).toHaveLength(2)
  const detailTable = getAllByRole('table')[1]
  const detailHeaders = within(detailTable).getAllByRole('columnheader').map((th) => th.textContent)
  expect(detailHeaders).toEqual(['lot', 'balance', 'created', 'expires'])
  const [, ...detailRows] = within(detailTable).getAllByRole('row')
  expect(detailRows.map(cellTexts)).toEqual([
    ['L-9', '1.5', 'Nov 8', 'Nov 12'],
    ['L-22', '14.5', 'Nov 11', 'Nov 15'],
  ])
  expect(queryByText('L-21')).toBeNull()

  fireEvent.click(getByText('beef-raw'))

  expect(getAllByRole('table')).toHaveLength(1)
  expect(queryByText('L-9')).toBeNull()
  expect(queryByText('L-22')).toBeNull()
})

test('renders nothing for an empty array', () => {
  const { container } = render(<StockTable rows={[]} />)
  expect(container.innerHTML).toBe('')
})
