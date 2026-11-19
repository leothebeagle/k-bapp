import type { Item, Lot, StockEntry, Transaction } from '@/lib/shared/types';

import StockTable from '@/components/tables/StockTable';
import DataTable from '@/components/tables/DataTable';
import RestockForm from '@/components/forms/RestockForm';

type Props = {
  stock: StockEntry[];
  lots: Lot[];
  transactions: Transaction[];
  items: Item[];
};

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

export default function RestockPage({ stock, lots, transactions, items }: Props) {
  return (
    <>
      <Section title='Stock' className='w-full'>
        <StockTable rows={stock} />
      </Section>

      <RestockForm items={items} />

      <Section title='Lots'>
        <DataTable rows={lots} />
      </Section>

      <Section title='Transactions'>
        <DataTable rows={transactions} />
      </Section>

      <Section title='Items'>
        <DataTable rows={items} />
      </Section>
    </>
  );
}
