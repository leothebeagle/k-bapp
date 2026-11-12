'use client';

import { useEffect, useState } from 'react';
import type { StockEntry } from '@/lib/data';
import type { Item, Lot, Transaction } from '@/lib/types';
import StockTable from '@/app/_components/tables/StockTable';
import DataTable from '@/app/_components/tables/DataTable';

type Data = {
  stock: StockEntry[];
  lots: Lot[];
  transactions: Transaction[];
  items: Item[];
};

async function getJson<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`${url} responded ${response.status}`);
  return response.json();
}

function Section({
  title,
  className = 'w-fit',
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`flex flex-col overflow-hidden rounded border border-zinc-200 bg-white ${className}`}
    >
      <h2 className='border-b border-zinc-200 px-3 py-2 font-semibold'>
        {title}
      </h2>
      <div className='flex-1 overflow-auto'>{children}</div>
    </section>
  );
}

export default function StockPage() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Abort on unmount so a late response can't set state (also covers Strict Mode's double effect).
    const controller = new AbortController();
    const { signal } = controller;

    Promise.all([
      getJson<StockEntry[]>('/api/stock', signal),
      getJson<Lot[]>('/api/lots', signal),
      getJson<Transaction[]>('/api/transactions', signal),
      getJson<Item[]>('/api/items', signal),
    ])
      .then(([stock, lots, transactions, items]) =>
        setData({ stock, lots, transactions, items }),
      )
      .catch((err: unknown) => {
        if (signal.aborted) return;
        setError(err instanceof Error ? err.message : String(err));
      });

    return () => controller.abort();
  }, []);

  if (error) {
    return (
      <p
        role='alert'
        className='rounded border border-red-200 bg-red-50 px-3 py-2 text-red-700'
      >
        Failed to load stock data: {error}
      </p>
    );
  }

  if (!data) return <p className='text-zinc-500'>Loading…</p>;

  return (
    <>
      <Section title='Stock' className='w-full'>
        <StockTable rows={data.stock} />
      </Section>

      <Section title='Lots'>
        <DataTable rows={data.lots} />
      </Section>

      <Section title='Transactions'>
        <DataTable rows={data.transactions} />
      </Section>

      <Section title='Items'>
        <DataTable rows={data.items} />
      </Section>
    </>
  );
}
