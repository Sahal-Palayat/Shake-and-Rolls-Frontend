import type { components } from '@/types/api';
import type { CartLineInput } from '@/features/cart/cart';
import { findOption, type MenuItem } from '@/features/menu/menu';

type Order = components['schemas']['OrderDto'];

/**
 * Turns a past order into cart lines using TODAY's menu. A line is skipped whole if its item or any of its
 * add-ons is gone or sold out: we never quietly change what someone is ordering.
 */
export function reorderLines(order: Pick<Order, 'lines'>, items: Map<string, MenuItem>): { lines: CartLineInput[]; skipped: string[] } {
  const lines: CartLineInput[] = [];
  const skipped: string[] = [];
  for (const l of order.lines) {
    const item = items.get(l.menuItemId);
    const optionIds = l.options.map((o) => o.optionId);
    const ok = !!item && item.isAvailable && optionIds.every((id) => findOption(item, id)?.option.isAvailable);
    if (!ok) {
      skipped.push(l.name);
      continue;
    }
    lines.push({ menuItemId: l.menuItemId, optionIds, quantity: l.quantity, note: l.note ?? '', name: item.name });
  }
  return { lines, skipped };
}
