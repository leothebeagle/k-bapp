'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Item } from '@/lib/shared/types';
import {
  aggregateFormItems,
  rowsMissingItem,
  rowsMissingQuantity,
  type RestockRow,
} from '@/lib/shared/restockForm';

const DEFAULT_ROWS = 3;

/** 0.5, 1, 1.5 … 10. */
const QUANTITY_OPTIONS = Array.from({ length: 20 }, (_, i) => (i + 1) / 2);

const emptyRows = (): RestockRow[] =>
  Array.from({ length: DEFAULT_ROWS }, () => ({
    itemId: null,
    quantity: null,
  }));

const selectClass = 'rounded border border-zinc-300 bg-white px-2 py-1';

export default function RestockForm({ items }: { items: Item[] }) {
  const router = useRouter();
  const [rows, setRows] = useState<RestockRow[]>(emptyRows);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const itemsById = new Map(items.map((item) => [item.id, item]));

  function updateRow(index: number, change: Partial<RestockRow>) {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...change } : row)),
    );
    setError(null);
  }

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const missing = rowsMissingQuantity(rows);
    if (missing.length > 0) {
      setError(
        `Choose a quantity for row${missing.length > 1 ? 's' : ''} ${missing.join(', ')}.`,
      );
      return;
    }

    const missingItem = rowsMissingItem(rows);
    if (missingItem.length > 0) {
      setError(
        `Choose an item for row${missingItem.length > 1 ? 's' : ''} ${missingItem.join(', ')}.`,
      );
      return;
    }

    const restockFormItems = aggregateFormItems(rows);
    if (restockFormItems.length === 0) {
      setError('Choose at least one item.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/supply-restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restockFormItems }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(
          result.error ?? `/api/supply-restock responded ${response.status}`,
        );
      }
      alert(result.message);
      setRows(emptyRows());
      // Re-render the Server Components so the tables show the new stock.
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className='flex w-fit flex-col rounded border border-zinc-200 bg-white'>
      <h2 className='border-b border-zinc-200 px-3 py-2 font-semibold'>
        Restock
      </h2>
      <form onSubmit={handleSubmit} className='flex flex-col gap-2 p-3 text-sm'>
        {rows.map((row, i) => {
          const n = i + 1;
          const unit =
            row.itemId === null
              ? ''
              : (itemsById.get(row.itemId)?.stockUnit ?? '');
          return (
            <div
              key={i}
              role='group'
              aria-label={`Row ${n}`}
              className='flex items-center gap-2'
            >
              <span className='w-5 text-zinc-500'>{n}</span>
              <select
                aria-label={`Item, row ${n}`}
                className={`${selectClass} w-44`}
                value={row.itemId ?? ''}
                onChange={(e) =>
                  updateRow(i, {
                    itemId:
                      e.target.value === '' ? null : Number(e.target.value),
                  })
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
                  updateRow(i, {
                    quantity:
                      e.target.value === '' ? null : Number(e.target.value),
                  })
                }
              >
                <option value=''>Qty…</option>
                {QUANTITY_OPTIONS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
              <output
                aria-label={`Unit, row ${n}`}
                className='w-16 text-zinc-600'
              >
                {unit}
              </output>
            </div>
          );
        })}

        <button
          type='button'
          onClick={() =>
            setRows((current) => [...current, { itemId: null, quantity: null }])
          }
          // ml-7 = number column (w-5) + gap-2; w-70 = item (w-44) + gap-2 + quantity (w-24).
          className='ml-7 w-70 self-start rounded border border-zinc-300 px-3 py-1 hover:bg-zinc-100'
        >
          + Row
        </button>

        {error && (
          <p
            role='alert'
            className='rounded border border-red-200 bg-red-50 px-3 py-2 text-red-700'
          >
            {error}
          </p>
        )}

        <div className='flex justify-end gap-2 pt-1'>
          <button
            type='button'
            onClick={() => {
              setRows(emptyRows());
              setError(null);
            }}
            className='rounded border border-zinc-300 bg-red-100 px-3 py-1 hover:bg-red-200'
          >
            Clear
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
