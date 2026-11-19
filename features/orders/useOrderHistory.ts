import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { components } from '@/types/api';
import type { OrdersHistoryProps } from '@/ui/orders/OrdersHistory';
import type { NoticeProps } from '@/ui/common/Notice';
import { api, errorText, unwrap } from '@/features/api/client';
import { useCustomerAuth } from '@/features/auth/useCustomerAuth';
import { isPickup } from '@/features/common/address';
import { formatDateTime, formatPaise } from '@/features/common/format';
import { statusLabel, statusTone } from './status';
import { useReorder } from './useReorder';

type Order = components['schemas']['OrderDto'];

export function useOrderHistory(): OrdersHistoryProps {
  const router = useRouter();
  const auth = useCustomerAuth({ title: 'See your orders', description: 'Verify the number you order with.' });
  const token = auth.session?.token;
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [notice, setNotice] = useState<NoticeProps | undefined>();
  const reorder = useReorder((text) => setNotice({ kind: 'error', text, onDismiss: () => setNotice(undefined) }));

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setOrders(await unwrap(api.GET('/api/orders', { params: { query: { limit: 50 } } })));
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!auth.isReady) return;
    if (!token) {
      setOrders([]);
      setLoading(false);
      return;
    }
    void load();
  }, [auth.isReady, token, load]);

  const signedOut = auth.isReady && !auth.isSignedIn;
  return {
    title: 'My orders',
    isLoading: !auth.isReady || (!!token && isLoading),
    loadingLabel: 'Loading your orders',
    notice,
    verify: signedOut ? auth.otpPanel : undefined,
    message: signedOut ? undefined : error ? { text: error, actionLabel: 'Try again', onAction: () => void load() } : orders.length === 0 ? { text: 'No orders yet. Your first one will show up here.', actionLabel: 'See the menu', onAction: () => router.push('/') } : undefined,
    orders: signedOut
      ? []
      : orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          dateLabel: formatDateTime(o.createdAt),
          badge: { label: statusLabel(o), tone: statusTone(o.status) },
          fulfillmentLabel: isPickup(o) ? 'Pickup' : 'Delivery',
          summaryText: o.lines.map((l) => `${l.quantity} × ${l.name}`).join(', '),
          totalLabel: formatPaise(o.totalPaise),
          openAriaLabel: `Open order ${o.orderNumber}`,
          onOpen: () => router.push(`/orders/${o.id}`),
          reorder: { label: 'Order again', isLoading: reorder.busyId === o.id, onClick: () => void reorder.reorder(o) },
        })),
  };
}
