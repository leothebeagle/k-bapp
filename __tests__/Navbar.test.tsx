import { afterEach, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import Navbar from '@/components/Navbar'

afterEach(cleanup)

test('renders a link to /restock', () => {
  const { getByRole } = render(<Navbar />)
  expect(getByRole('link', { name: 'Restock' }).getAttribute('href')).toBe('/restock')
})
