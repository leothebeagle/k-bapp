'use client';

import { useEffect, useState } from 'react';
import type { Item } from '@/lib/types';
import {
  aggregateRestock,
  rowsMissingQuantity,
  type RestockRow,
} from '@/lib/restock';

const DEFAULT_ROWS = 3;

/** 0.5, 1, 1.5 … 50. */
const QUANTITY_OPTIONS = Array.from({ length: 100 }, (_, i) => (i + 1) / 2);

const emptyRows = (): RestockRow[] =>
  Array.from({ length: DEFAULT_ROWS }, () => ({ itemId: null, quantity: null }));

const selectClass = 'rounded border border-zinc-300 bg-white px-2 py-1';

export default function RestockForm() {
  const [items, setItems] = useState<Item[]>([]);
  const [rows, setRows] = useState<RestockRow[]>(emptyRows);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Abort on unmount so a late response can't set state.
    const controller = new AbortController();
    fetch('/api/items', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`/api/items responded ${response.status}`);
        return response.json() as Promise<Item[]>;
      })
      .then(setItems)
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : String(err));
      });
    return () => controller.abort();
  }, []);

  const itemsById = new Map(items.map((item) => [item.id, item]));

  function updateRow(index: number, change: Partial<RestockRow>) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...change } : row)),
    );
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const missing = rowsMissingQuantity(rows);
    if (missing.length > 0) {
      setError(
        `Choose a quantity for row${missing.length > 1 ? 's' : ''} ${missing.join(', ')}.`,
      );
      return;
    }

    const lines = aggregateRestock(rows);
    if (lines.length === 0) {
      setError('Choose at least one item.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/supply-restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(result.error ?? `/api/supply-restock responded ${response.status}`);
      }
      alert(result.message);
      setRows(emptyRows());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className='flex w-fit flex-col rounded border border-zinc-200 bg-white'>
      <h2 className='border-b border-zinc-200 px-3 py-2 font-semibold'>Restock</h2>
      <form onSubmit={handleSubmit} className='flex flex-col gap-2 p-3 text-sm'>
        {rows.map((row, i) => {
          const n = i + 1;
          const unit = row.itemId === null ? '' : itemsById.get(row.itemId)?.stockUnit ?? '';
          return (
            <div key={i} role='group' aria-label={`Row ${n}`} className='flex items-center gap-2'>
              <span className='w-5 text-zinc-500'>{n}</span>
              <select
                aria-label={`Item, row ${n}`}
                className={`${selectClass} w-44`}
                value={row.itemId ?? ''}
                onChange={(e) =>
                  updateRow(i, { itemId: e.target.value === '' ? null : Number(e.target.value) })
                }
              >
                <option value=''>Choose item…</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <select
                aria-label={`Quantity, row ${n}`}
                className={`${selectClass} w-24`}
                value={row.quantity ?? ''}
                onChange={(e) =>
                  updateRow(i, { quantity: e.target.value === '' ? null : Number(e.target.value) })
                }
              >
                <option value=''>Qty…</option>
                {QUANTITY_OPTIONS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
              <output aria-label={`Unit, row ${n}`} className='w-16 text-zinc-600'>
                {unit}
              </output>
            </div>
          );
        })}

        {error && (
          <p role='alert' className='rounded border border-red-200 bg-red-50 px-3 py-2 text-red-700'>
            {error}
          </p>
        )}

        <div className='flex gap-2 pt-1'>
          <button
            type='button'
            onClick={() => setRows((current) => [...current, { itemId: null, quantity: null }])}
            className='rounded border border-zinc-300 px-3 py-1 hover:bg-zinc-100'
          >
            Add row
          </button>
          <button
            type='submit'
            disabled={submitting}
            className='rounded bg-zinc-900 px-3 py-1 text-white hover:bg-zinc-700 disabled:opacity-50'
          >
            Restock
          </button>
        </div>
      </form>
    </section>
  );
}
