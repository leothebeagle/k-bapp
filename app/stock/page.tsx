import { items, lots, stock, transactions } from '@/lib/fixtures'
import StockTable from './StockTable'
import { formatDate, formatDateTime } from './format'

const itemById = new Map(items.map((i) => [i.id, i]))
const lotById = new Map(lots.map((l) => [l.id, l]))

const th = 'px-3 py-2'
const td = 'px-3 py-2'
const thead = 'sticky top-0 bg-zinc-100 text-left text-zinc-600'
const row = 'border-t border-zinc-200'

function Section({ title, className = '', children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={`flex flex-col overflow-hidden rounded border border-zinc-200 bg-white ${className}`}>
      <h2 className="border-b border-zinc-200 px-3 py-2 font-semibold">{title}</h2>
      <div className="flex-1 overflow-auto">{children}</div>
    </section>
  )
}

export default function StockPage() {
  const lotsNewestFirst = [...lots].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const transactionsNewestFirst = [...transactions].sort(
    (a, b) => b.timestamp.localeCompare(a.timestamp) || b.id.localeCompare(a.id, undefined, { numeric: true }),
  )

  return (
    <main className="flex flex-1 flex-col gap-4 bg-zinc-50 p-4 text-zinc-900">
      <Section title="Stock" className="min-h-[33vh]">
        <StockTable stock={stock} items={items} />
      </Section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section title="Lots">
          <table className="w-full text-sm">
            <thead className={thead}>
              <tr>
                <th className={th}>ID</th>
                <th className={th}>Item</th>
                <th className={th}>Created</th>
                <th className={th}>Expires</th>
                <th className={th}>Finished</th>
              </tr>
            </thead>
            <tbody>
              {lotsNewestFirst.map((lot) => (
                <tr key={lot.id} className={row}>
                  <td className={td}>{lot.id}</td>
                  <td className={td}>{itemById.get(lot.itemId)?.name ?? lot.itemId}</td>
                  <td className={td}>{formatDate(lot.createdAt)}</td>
                  <td className={td}>{formatDate(lot.expiresAt)}</td>
                  <td className={td}>{lot.finishedAt ? formatDate(lot.finishedAt) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Transactions">
          <table className="w-full text-sm">
            <thead className={thead}>
              <tr>
                <th className={th}>ID</th>
                <th className={th}>Time</th>
                <th className={th}>Lot</th>
                <th className={th}>Item</th>
                <th className={`${th} text-right`}>Quantity</th>
                <th className={th}>Type</th>
                <th className={th}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {transactionsNewestFirst.map((t) => {
                const item = itemById.get(lotById.get(t.lotId)?.itemId ?? '')
                return (
                  <tr key={t.id} className={row}>
                    <td className={td}>{t.id}</td>
                    <td className={`${td} whitespace-nowrap`}>{formatDateTime(t.timestamp)}</td>
                    <td className={td}>{t.lotId}</td>
                    <td className={td}>{item?.name ?? '—'}</td>
                    <td className={`${td} text-right tabular-nums whitespace-nowrap`}>
                      {t.quantity > 0 ? `+${t.quantity}` : t.quantity} {item?.stockUnit}
                    </td>
                    <td className={td}>{t.type}</td>
                    <td className={`${td} text-zinc-600`}>{t.notes ?? ''}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Section>
      </div>

      <Section title="Items">
        <table className="w-full text-sm">
          <thead className={thead}>
            <tr>
              <th className={th}>ID</th>
              <th className={th}>Name</th>
              <th className={th}>Stage</th>
              <th className={th}>Stock unit</th>
              <th className={`${th} text-right`}>Shelf life (days)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className={row}>
                <td className={td}>{item.id}</td>
                <td className={td}>{item.name}</td>
                <td className={td}>{item.stage}</td>
                <td className={td}>{item.stockUnit}</td>
                <td className={`${td} text-right tabular-nums`}>{item.shelfLifeDays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </main>
  )
}
