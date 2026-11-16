import { afterEach, expect, test } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import Navbar from '@/components/Navbar'

afterEach(cleanup)

test('renders a link to /stock', () => {
  const { getByRole } = render(<Navbar />)
  expect(getByRole('link', { name: 'Stock' }).getAttribute('href')).toBe('/stock')
})
