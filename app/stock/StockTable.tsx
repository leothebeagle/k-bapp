'use client'

import { Fragment, useState } from 'react'
import DataTable, { formatCell } from './DataTable'

export type ExpandableRow = {
  summary: Record<string, unknown>
  details: Record<string, unknown>[]
}

export default function StockTable({ rows }: { rows: ExpandableRow[] }) {
  const [open, setOpen] = useState<Set<number>>(new Set())

  if (rows.length === 0) return null

  const columns = Object.keys(rows[0].summary)

  function toggle(index: number) {
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <table className="w-full text-sm">
      <thead className="bg-zinc-100 text-left text-zinc-600">
        <tr>
          <th className="w-8 px-3 py-2"></th>
          {columns.map((key) => (
            <th key={key} className="px-3 py-2">
              {key}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => {
          const isOpen = open.has(index)
          return (
            <Fragment key={index}>
              <tr
                className="cursor-pointer border-t border-zinc-200 hover:bg-zinc-50"
                onClick={() => toggle(index)}
              >
                <td className="px-3 py-2 text-zinc-400">{isOpen ? '▾' : '▸'}</td>
                {columns.map((key) => (
                  <td key={key} className="px-3 py-2">
                    {formatCell(row.summary[key])}
                  </td>
                ))}
              </tr>
              {isOpen && (
                <tr className="bg-zinc-50">
                  <td></td>
                  <td colSpan={columns.length} className="px-3 pb-3">
                    <DataTable rows={row.details} />
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
