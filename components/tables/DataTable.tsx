const cellBase = 'px-3 py-2'

export function formatCell(value: unknown): string | number {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' || typeof value === 'number') return value
  return JSON.stringify(value)
}

export default function DataTable({ rows }: { rows: Record<string, unknown>[] }) {
  if (rows.length === 0) return null

  const columns = Object.keys(rows[0])

  return (
    <table className="w-auto text-sm">
      <thead className="sticky top-0 bg-zinc-100 text-left text-zinc-600">
        <tr>
          {columns.map((key) => (
            <th key={key} className={cellBase}>
              {key}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={row.id != null ? String(row.id) : index} className="border-t border-zinc-200">
            {columns.map((key) => (
              <td key={key} className={cellBase}>
                {formatCell(row[key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
