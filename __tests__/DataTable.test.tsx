import { afterEach, expect, test } from 'vitest'
import { cleanup, render, within } from '@testing-library/react'
import DataTable from '@/app/_components/tables/DataTable'

afterEach(cleanup)

test('renders headers from the first row’s keys and one row of values per item', () => {
  const rows = [
    { id: 'flour', name: 'Flour', stage: 'raw', stockUnit: 'kg', shelfLifeDays: 180 },
    { id: 'sugar', name: 'Sugar', stage: 'raw', stockUnit: 'kg', shelfLifeDays: 365 },
  ]
  const { getByRole } = render(<DataTable rows={rows} />)
  const table = getByRole('table')

  const headers = within(table).getAllByRole('columnheader').map((th) => th.textContent)
  expect(headers).toEqual(['id', 'name', 'stage', 'stockUnit', 'shelfLifeDays'])

  const [, ...bodyRows] = within(table).getAllByRole('row')
  expect(bodyRows).toHaveLength(2)
  expect(within(bodyRows[0]).getAllByRole('cell').map((td) => td.textContent)).toEqual([
    'flour',
    'Flour',
    'raw',
    'kg',
    '180',
  ])
  expect(within(bodyRows[1]).getAllByRole('cell').map((td) => td.textContent)).toEqual([
    'sugar',
    'Sugar',
    'raw',
    'kg',
    '365',
  ])
})

test('renders nothing for an empty array', () => {
  const { container } = render(<DataTable rows={[]} />)
  expect(container.innerHTML).toBe('')
})
