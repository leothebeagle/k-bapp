import { listItems } from '@/lib/server/data/items';
import type { RestockFormItem } from '@/lib/shared/restockForm';

function badRequest(error: string) {
  return Response.json({ error }, { status: 400 });
}

function isFormItem(value: unknown): value is RestockFormItem {
  if (typeof value !== 'object' || value === null) return false;
  const { itemId, quantity } = value as Record<string, unknown>;
  return (
    Number.isInteger(itemId) &&
    typeof quantity === 'number' &&
    Number.isFinite(quantity) &&
    quantity > 0
  );
}

/**
 * Body: { restockFormItems: [{ itemId, quantity }] }. Nothing is saved yet;
 * the response lists each item with its name and stock unit.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest('Body must be JSON');
  }

  const restockFormItems = (body as { restockFormItems?: unknown } | null)
    ?.restockFormItems;
  if (!Array.isArray(restockFormItems) || restockFormItems.length === 0) {
    return badRequest('Body must have a non-empty restockFormItems array');
  }
  if (!restockFormItems.every(isFormItem)) {
    return badRequest(
      'Each restock form item needs an integer itemId and a positive quantity',
    );
  }

  // here we check that all itemIds are known, and if so, we return a message listing each item with its name and stock unit
  const items = new Map((await listItems()).map((item) => [item.id, item]));
  const unknown = restockFormItems.filter(
    (formItem) => !items.has(formItem.itemId),
  );
  if (unknown.length > 0) {
    return badRequest(
      `Unknown itemId: ${unknown.map((formItem) => formItem.itemId).join(', ')}`,
    );
  }

  const listed = restockFormItems.map((formItem) => {
    const item = items.get(formItem.itemId)!;
    return `${item.name} ${formItem.quantity} ${item.stockUnit}`;
  });
  return Response.json({
    message: `Successfully restocked: ${listed.join(', ')}`,
  });
}
