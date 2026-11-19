import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { RiderOrdersProps, RiderTileProps } from '@/ui/rider/RiderOrders';
import type { NoticeProps } from '@/ui/common/Notice';
import { OrderStatus, PaymentStatus } from '@/types/enums';
import { api, errorText, unwrap } from '@/features/api/client';
import { addressText } from '@/features/common/address';
import { formatAge, formatPaise, humanize } from '@/features/common/format';
import { statusTone } from '@/features/orders-admin/mapper';
import { ACTIVE_STATUSES, sortActive, type Order } from './rider';
import { useLiveRefresh } from './useLiveRefresh';

type Tab = 'active' | 'done';

const startOfTodayIso = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

export function useRiderOrders(): RiderOrdersProps {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('active');
  const [active, setActive] = useState<Order[]>([]);
  const [done, setDone] = useState<Order[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [notice, setNotice] = useState<NoticeProps | undefined>();
  const [now, setNow] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      const [a, d] = await Promise.all([
        unwrap(api.GET('/api/orders', { params: { query: { statuses: ACTIVE_STATUSES, limit: 50 } } })),
        unwrap(api.GET('/api/orders', { params: { query: { statuses: [OrderStatus.Delivered], from: startOfTodayIso(), limit: 50 } } })),
      ]);
      setActive(sortActive(a));
      setDone(d);
      setNotice(undefined);
      setNow(Date.now());
    } catch (e) {
      // keep the last good list on screen; only say that refreshing failed
      setNotice({ kind: 'error', text: errorText(e), onDismiss: () => setNotice(undefined) });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);
  const isLive = useLiveRefresh(() => void load());

  const tile = useCallback(
    (o: Order): RiderTileProps => {
      const cashDue = o.paymentMethod === 'cod' && o.paymentStatus !== PaymentStatus.CodCollected;
      return {
        id: o.id,
        orderNumber: o.orderNumber,
        badge: { label: humanize(o.status), tone: statusTone(o.status) },
        customerLabel: o.contactName,
        addressLabel: addressText(o, false) || '—',
        ageLabel: formatAge(o.createdAt, now),
        totalLabel: formatPaise(o.totalPaise),
        paymentLabel: cashDue ? `Collect ${formatPaise(o.totalPaise)} cash` : o.paymentMethod === 'cod' ? 'Cash collected' : 'Paid',
        isCashDue: cashDue,
        openLabel: 'Open',
        onOpen: () => router.push(`/rider/orders/${o.id}`),
      };
    },
    [router, now],
  );

  const list = tab === 'active' ? active : done;
  const tiles = useMemo(() => list.map(tile), [list, tile]);

  return {
    title: 'My orders',
    tabsLabel: 'Order lists',
    tabs: [
      { id: 'active', label: `To deliver (${active.length})`, isSelected: tab === 'active', onSelect: () => setTab('active') },
      { id: 'done', label: `Done today (${done.length})`, isSelected: tab === 'done', onSelect: () => setTab('done') },
    ],
    isLoading,
    loadingLabel: 'Loading your orders',
    notice,
    live: { label: isLive ? 'Live' : 'Updating every 15 s', isLive },
    orders: tiles,
    emptyText: tab === 'active' ? 'No orders for you right now. New ones appear here by themselves.' : 'Nothing delivered yet today.',
    refreshLabel: 'Refresh',
    onRefresh: () => void load(),
  };
}
