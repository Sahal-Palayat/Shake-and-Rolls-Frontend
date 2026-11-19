import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { components } from '@/types/api';
import { api, errorText, unwrap } from '@/features/api/client';
import { cartActions } from '@/features/cart/cartStore';
import { indexItems } from '@/features/menu/menu';
import { reorderLines } from './reorder';

type Order = components['schemas']['OrderDto'];

/** "Order again": rebuilds the cart from today's menu, then shows it. Anything unavailable is listed, not hidden. */
export function useReorder(onError: (text: string) => void) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const reorder = async (order: Order) => {
    setBusyId(order.id);
    try {
      const items = indexItems(await unwrap(api.GET('/api/menu')));
      const { lines, skipped } = reorderLines(order, items);
      if (!lines.length) return onError('None of these items are available right now.');
      cartActions.addMany(lines);
      cartActions.setNotice(skipped.length ? `Not added because they are unavailable now: ${skipped.join(', ')}.` : undefined);
      cartActions.openDrawer();
      router.push('/');
    } catch (e) {
      onError(errorText(e));
    } finally {
      setBusyId(null);
    }
  };
  return { reorder, busyId };
}
