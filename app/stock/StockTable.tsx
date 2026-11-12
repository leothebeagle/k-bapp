'use client'

import { Fragment, useState } from 'react'
import type { Item } from '@/lib/types'
import type { StockEntry } from '@/lib/fixtures'
import { formatDate } from './format'

export default function StockTable({ stock, items }: { stock: StockEntry[]; items: Item[] }) {
  const [open, setOpen] = useState<Set<string>>(new Set())
  const itemById = new Map(items.map((i) => [i.id, i]))

  function toggle(itemId: string) {
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  return (
    <table className="w-full text-sm">
      <thead className="bg-zinc-100 text-left text-zinc-600">
        <tr>
          <th className="w-8 px-3 py-2"></th>
          <th className="px-3 py-2">Item</th>
          <th className="px-3 py-2 text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        {stock.map((entry) => {
          const item = itemById.get(entry.itemId)
          const isOpen = open.has(entry.itemId)
          return (
            <Fragment key={entry.itemId}>
              <tr
                className="cursor-pointer border-t border-zinc-200 hover:bg-zinc-50"
                onClick={() => toggle(entry.itemId)}
              >
                <td className="px-3 py-2 text-zinc-400">{isOpen ? '▾' : '▸'}</td>
                <td className="px-3 py-2 font-medium">{item?.name ?? entry.itemId}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {entry.total} {item?.stockUnit}
                </td>
              </tr>
              {isOpen && (
                <tr className="bg-zinc-50">
                  <td></td>
                  <td colSpan={2} className="px-3 pb-3">
                    <table className="w-full text-xs">
                      <thead className="text-left text-zinc-500">
                        <tr>
                          <th className="px-2 py-1">Lot</th>
                          <th className="px-2 py-1 text-right">Balance</th>
                          <th className="px-2 py-1">Created</th>
                          <th className="px-2 py-1">Expires</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entry.lots.map((lot) => (
                          <tr key={lot.lotId} className="border-t border-zinc-200">
                            <td className="px-2 py-1">{lot.lotId}</td>
                            <td className="px-2 py-1 text-right tabular-nums">
                              {lot.balance} {item?.stockUnit}
                            </td>
                            <td className="px-2 py-1">{formatDate(lot.createdAt)}</td>
                            <td className="px-2 py-1">{formatDate(lot.expiresAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </Fragment>
          )
        })}
      </tbody>
    </table>
  )
}
