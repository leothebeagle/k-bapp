import StockTable from './StockTable'
import DataTable from './DataTable'

function Section({ title, className = '', children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={`flex flex-col overflow-hidden rounded border border-zinc-200 bg-white ${className}`}>
      <h2 className="border-b border-zinc-200 px-3 py-2 font-semibold">{title}</h2>
      <div className="flex-1 overflow-auto">{children}</div>
    </section>
  )
}

export default function StockPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 bg-zinc-50 p-4 text-zinc-900">
      <Section title="Stock" className="min-h-[33vh]">
        <StockTable rows={[]} />
      </Section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section title="Lots">
          <DataTable rows={[]} />
        </Section>

        <Section title="Transactions">
          <DataTable rows={[]} />
        </Section>
      </div>

      <Section title="Items">
        <DataTable rows={[]} />
      </Section>
    </main>
  )
}
