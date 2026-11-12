import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import RestockForm from '@/app/_components/forms/RestockForm'

const items = [
  { id: 1, code: 'IT-1', name: 'beef-raw', stage: 'BASE_INPUT', stockUnit: 'KG', shelfLifeDays: 4 },
  { id: 2, code: 'IT-2', name: 'soy-sauce', stage: 'BASE_INPUT', stockUnit: 'LITER', shelfLifeDays: 365 },
]

const MESSAGE = 'Successfully restocked: beef-raw 15 KG, soy-sauce 2 LITER'

let fetchMock: ReturnType<typeof vi.fn>
let alertMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  fetchMock = vi.fn(async (url: string) =>
    url === '/api/supply-restock' ? Response.json({ message: MESSAGE }) : Response.json(items),
  )
  alertMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('alert', alertMock)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

/** Renders the form and waits for the items from /api/items to fill the dropdowns. */
async function renderLoaded() {
  render(<RestockForm />)
  await screen.findAllByRole('option', { name: 'beef-raw' })
}

const choose = (label: string, value: string | number) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value: String(value) } })

const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Restock' }))

const postCalls = () => fetchMock.mock.calls.filter(([url]) => url === '/api/supply-restock')

test('fetches items on load', async () => {
  await renderLoaded()
  expect(fetchMock).toHaveBeenCalledWith('/api/items', expect.anything())
})

test('renders 3 rows, and Add row makes it 4', async () => {
  await renderLoaded()
  expect(screen.getAllByRole('group')).toHaveLength(3)

  fireEvent.click(screen.getByRole('button', { name: 'Add row' }))
  expect(screen.getAllByRole('group')).toHaveLength(4)
  expect(screen.getByLabelText('Item, row 4')).toBeTruthy()
})

test('has no typed inputs, and quantity options run 0.5 to 50 in steps of 0.5', async () => {
  const { container } = render(<RestockForm />)
  await screen.findAllByRole('option', { name: 'beef-raw' })
  expect(container.querySelectorAll('input, textarea')).toHaveLength(0)

  const select = screen.getByLabelText('Quantity, row 1') as HTMLSelectElement
  const values = Array.from(select.options, (o) => o.value).filter((v) => v !== '')
  expect(values).toHaveLength(100)
  expect(values[0]).toBe('0.5')
  expect(values[1]).toBe('1')
  expect(values.at(-1)).toBe('50')
})

test('choosing an item shows its stock unit', async () => {
  await renderLoaded()
  const unit = screen.getByLabelText('Unit, row 1')
  expect(unit.textContent).toBe('')

  choose('Item, row 1', 1)
  expect(unit.textContent).toBe('KG')

  choose('Item, row 1', 2)
  expect(unit.textContent).toBe('LITER')
})

test('submits the combined lines and alerts the returned message', async () => {
  await renderLoaded()
  fireEvent.click(screen.getByRole('button', { name: 'Add row' }))

  choose('Item, row 1', 1)
  choose('Quantity, row 1', 5)
  // Row 2 stays empty and is skipped.
  choose('Item, row 3', 2)
  choose('Quantity, row 3', 2)
  choose('Item, row 4', 1)
  choose('Quantity, row 4', 10)
  submit()

  await waitFor(() => expect(alertMock).toHaveBeenCalledWith(MESSAGE))

  expect(postCalls()).toHaveLength(1)
  const [, init] = postCalls()[0]
  expect(init.method).toBe('POST')
  expect(JSON.parse(init.body)).toEqual({
    lines: [
      { itemId: 1, quantity: 15 },
      { itemId: 2, quantity: 2 },
    ],
  })
})

test('a row with an item but no quantity blocks the submit', async () => {
  await renderLoaded()
  choose('Item, row 1', 1)
  choose('Quantity, row 1', 5)
  choose('Item, row 2', 2)
  submit()

  const alert = await screen.findByRole('alert')
  expect(alert.textContent).toContain('row 2')
  expect(postCalls()).toHaveLength(0)
  expect(alertMock).not.toHaveBeenCalled()
})
