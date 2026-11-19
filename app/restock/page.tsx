import { Suspense } from 'react';
import { connection } from 'next/server';
import { getStock } from '@/lib/server/data/stock';
import { listLots } from '@/lib/server/data/lots';
import { listTransactions } from '@/lib/server/data/transactions';
import { listItems } from '@/lib/server/data/items';
import RestockPage from './RestockPage';

async function StockData() {
  // Always read the database at request time, never prerender at build.
  await connection();
  const [stock, lots, transactions, items] = await Promise.all([
    getStock(),
    listLots(),
    listTransactions(),
    listItems(),
  ]);
  return (
    <RestockPage
      stock={stock}
      lots={lots}
      transactions={transactions}
      items={items}
    />
  );
}

export default function Page() {
  return (
    <main className='flex flex-1 flex-col gap-4 bg-zinc-50 p-4 text-zinc-900'>
      <Suspense fallback={<p className='text-zinc-500'>Loading…</p>}>
        <StockData />
      </Suspense>
    </main>
  );
}
