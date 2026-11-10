import { describe, expect, test } from 'vitest'
import { checkPar } from '@/lib/checkPar'
import { estimateStock } from '@/lib/estimateStock'
import { items, parLevels, transactions } from '@/lib/fixtures'

const rawBeefPar = parLevels.filter((p) => p.itemId === '001') // min 10 kg

describe('checkPar', () => {
  test('classifies every fixture item from the fixture transactions', () => {
    const report = checkPar(estimateStock(transactions), parLevels, items)

    expect(report).toHaveLength(29)
    expect(report.filter((r) => r.status === 'good')).toEqual([
      { itemId: '001', status: 'good' }, // 15 vs par 10
      { itemId: '009', status: 'good' }, // 6 vs par 5
    ])
    expect(report.filter((r) => r.status === 'low')).toEqual([
      { itemId: '018', status: 'low' }, // 4 vs par 6
    ])
    expect(report.filter((r) => r.status === 'critical')).toHaveLength(26)
  })

  test('applies the par and 50%-of-par boundaries', () => {
    const at = (quantity: number) => checkPar([{ itemId: '001', quantity }], rawBeefPar, items)

    expect(at(10)).toEqual([{ itemId: '001', status: 'good' }])
    expect(at(9.99)).toEqual([{ itemId: '001', status: 'low' }])
    expect(at(5)).toEqual([{ itemId: '001', status: 'low' }])
    expect(at(4.99)).toEqual([{ itemId: '001', status: 'critical' }])
  })

  test('treats missing stock as zero and ignores stock without a par level', () => {
    expect(checkPar([], rawBeefPar, items)).toEqual([{ itemId: '001', status: 'critical' }])
    expect(checkPar([{ itemId: '009', quantity: 6 }], rawBeefPar, items)).toEqual([
      { itemId: '001', status: 'critical' },
    ])
  })

  test('skips made-to-order items even when they are below par', () => {
    const report = checkPar(estimateStock(transactions), parLevels, items) // '030' is at -10 vs par 30
    const ids = report.map((r) => r.itemId)

    expect(ids).not.toContain('030')
    expect(ids).not.toContain('031')
    expect(ids).not.toContain('032')
  })
})
