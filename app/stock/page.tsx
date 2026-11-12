import StockTables from './StockTables'

export default function StockPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 bg-zinc-50 p-4 text-zinc-900">
      <StockTables />
    </main>
  )
}
