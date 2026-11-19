import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import RestockForm from '@/components/forms/RestockForm'
import { ItemStage, Unit, type Item } from '@/lib/shared/types'

const refreshMock = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: refreshMock }) }))

const items: Item[] = [
  { id: 1, code: 'IT-1', name: 'beef-raw', stage: ItemStage.BASE_INPUT, stockUnit: Unit.KG, shelfLifeDays: 4 },
  { id: 2, code: 'IT-2', name: 'soy-sauce', stage: ItemStage.BASE_INPUT, stockUnit: Unit.LITER, shelfLifeDays: 365 },
]

const MESSAGE = 'Successfully restocked: beef-raw 15 KG, soy-sauce 2 LITER'

let fetchMock: ReturnType<typeof vi.fn>
let alertMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  fetchMock = vi.fn(async () => Response.json({ message: MESSAGE }))
  refreshMock.mockClear()
  alertMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('alert', alertMock)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function renderForm() {
  return render(<RestockForm items={items} />)
}

const choose = (label: string, value: string | number) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value: String(value) } })

const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Restock' }))

const postCalls = () => fetchMock.mock.calls.filter(([url]) => url === '/api/supply-restock')

test('fills the item dropdowns from the items prop without fetching', () => {
  renderForm()
  expect(screen.getAllByRole('option', { name: 'beef-raw' })).toHaveLength(3)
  expect(screen.getAllByRole('option', { name: 'soy-sauce' })).toHaveLength(3)
  expect(fetchMock).not.toHaveBeenCalled()
})

test('renders 3 rows, and + Row makes it 4', async () => {
  renderForm()
  expect(screen.getAllByRole('group')).toHaveLength(3)

  fireEvent.click(screen.getByRole('button', { name: '+ Row' }))
  expect(screen.getAllByRole('group')).toHaveLength(4)
  expect(screen.getByLabelText('Item, row 4')).toBeTruthy()
})

test('has no typed inputs, and quantity options run 0.5 to 10 in steps of 0.5', async () => {
  const { container } = renderForm()
  expect(container.querySelectorAll('input, textarea')).toHaveLength(0)

  const select = screen.getByLabelText('Quantity, row 1') as HTMLSelectElement
  const values = Array.from(select.options, (o) => o.value).filter((v) => v !== '')
  expect(values).toHaveLength(20)
  expect(values[0]).toBe('0.5')
  expect(values[1]).toBe('1')
  expect(values.at(-1)).toBe('10')
})

test('choosing an item shows its stock unit', async () => {
  renderForm()
  const unit = screen.getByLabelText('Unit, row 1')
  expect(unit.textContent).toBe('')

  choose('Item, row 1', 1)
  expect(unit.textContent).toBe('KG')

  choose('Item, row 1', 2)
  expect(unit.textContent).toBe('LITER')
})

test('submits the combined restock form items and alerts the returned message', async () => {
  renderForm()
  fireEvent.click(screen.getByRole('button', { name: '+ Row' }))

  choose('Item, row 1', 1)
  choose('Quantity, row 1', 5)
  // Row 2 stays empty and is skipped.
  choose('Item, row 3', 2)
  choose('Quantity, row 3', 2)
  choose('Item, row 4', 1)
  choose('Quantity, row 4', 10)
  submit()

  await waitFor(() => expect(alertMock).toHaveBeenCalledWith(MESSAGE))
  expect(refreshMock).toHaveBeenCalledTimes(1)

  expect(postCalls()).toHaveLength(1)
  const [, init] = postCalls()[0]
  expect(init.method).toBe('POST')
  expect(JSON.parse(init.body)).toEqual({
    restockFormItems: [
      { itemId: 1, quantity: 15 },
      { itemId: 2, quantity: 2 },
    ],
  })
})

test('a row with an item but no quantity blocks the submit', async () => {
  renderForm()
  choose('Item, row 1', 1)
  choose('Quantity, row 1', 5)
  choose('Item, row 2', 2)
  submit()

  const alert = await screen.findByRole('alert')
  expect(alert.textContent).toContain('row 2')
  expect(postCalls()).toHaveLength(0)
  expect(alertMock).not.toHaveBeenCalled()
})

test('a row with a quantity but no item blocks the submit', async () => {
  renderForm()
  choose('Item, row 1', 1)
  choose('Quantity, row 1', 5)
  choose('Quantity, row 2', 2)
  submit()

  const alert = await screen.findByRole('alert')
  expect(alert.textContent).toBe('Choose an item for row 2.')
  expect(postCalls()).toHaveLength(0)
  expect(alertMock).not.toHaveBeenCalled()
})

const clear = () => fireEvent.click(screen.getByRole('button', { name: 'Clear' }))

const value = (label: string) => (screen.getByLabelText(label) as HTMLSelectElement).value

test('Clear brings back 3 empty rows', async () => {
  renderForm()
  fireEvent.click(screen.getByRole('button', { name: '+ Row' }))
  choose('Item, row 1', 1)
  choose('Quantity, row 1', 5)
  choose('Item, row 2', 2)
  choose('Quantity, row 2', 2)

  clear()

  expect(screen.getAllByRole('group')).toHaveLength(3)
  for (const n of [1, 2, 3]) {
    expect(value(`Item, row ${n}`)).toBe('')
    expect(value(`Quantity, row ${n}`)).toBe('')
    expect(screen.getByLabelText(`Unit, row ${n}`).textContent).toBe('')
  }
  expect(postCalls()).toHaveLength(0)
})

test('Clear removes the error message', async () => {
  renderForm()
  choose('Item, row 1', 1)
  submit()
  await screen.findByRole('alert')

  clear()

  expect(screen.queryByRole('alert')).toBeNull()
  expect(postCalls()).toHaveLength(0)
})

test('a failed submit shows the error and does not refresh', async () => {
  fetchMock.mockResolvedValueOnce(Response.json({ error: 'Unknown item 9' }, { status: 400 }))
  renderForm()
  choose('Item, row 1', 1)
  choose('Quantity, row 1', 5)
  submit()

  const alert = await screen.findByRole('alert')
  expect(alert.textContent).toBe('Unknown item 9')
  expect(refreshMock).not.toHaveBeenCalled()
  expect(alertMock).not.toHaveBeenCalled()
})
