import { describe, expect, test } from 'vitest'
import { checkPar } from '@/lib/checkPar'
import { estimateStock } from '@/lib/estimateStock'
import { parLevels, transactions } from '@/lib/fixtures'

const rawBeefPar = parLevels.filter((p) => p.itemId === 'raw-beef') // min 10 kg

describe('checkPar', () => {
  test('classifies every fixture item from the fixture transactions', () => {
    const report = checkPar(estimateStock(transactions), parLevels)

    expect(report).toHaveLength(32)
    expect(report.filter((r) => r.status === 'good')).toEqual([
      { itemId: 'raw-beef', status: 'good' }, // 15 vs par 10
      { itemId: 'soy-sauce', status: 'good' }, // 6 vs par 5
    ])
    expect(report.filter((r) => r.status === 'low')).toEqual([
      { itemId: 'beef-marinade', status: 'low' }, // 4 vs par 6
    ])
    expect(report.filter((r) => r.status === 'critical')).toHaveLength(29)
    expect(report.find((r) => r.itemId === 'beef-kimbap')).toEqual({
      itemId: 'beef-kimbap',
      status: 'critical', // -10 vs par 30
    })
  })

  test('applies the par and 50%-of-par boundaries', () => {
    const at = (quantity: number) => checkPar([{ itemId: 'raw-beef', quantity }], rawBeefPar)

    expect(at(10)).toEqual([{ itemId: 'raw-beef', status: 'good' }])
    expect(at(9.99)).toEqual([{ itemId: 'raw-beef', status: 'low' }])
    expect(at(5)).toEqual([{ itemId: 'raw-beef', status: 'low' }])
    expect(at(4.99)).toEqual([{ itemId: 'raw-beef', status: 'critical' }])
  })

  test('treats missing stock as zero and ignores stock without a par level', () => {
    expect(checkPar([], rawBeefPar)).toEqual([{ itemId: 'raw-beef', status: 'critical' }])
    expect(checkPar([{ itemId: 'soy-sauce', quantity: 6 }], rawBeefPar)).toEqual([
      { itemId: 'raw-beef', status: 'critical' },
    ])
  })
})
