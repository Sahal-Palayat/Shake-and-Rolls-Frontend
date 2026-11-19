import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import type { components } from '@/types/api';
import type { OrderTrackerProps } from '@/ui/orders/OrderTracker';
import type { NoticeProps } from '@/ui/common/Notice';
import { API_ORIGIN, ApiError, api, errorText, unwrap } from '@/features/api/client';
import { useCustomerAuth } from '@/features/auth/useCustomerAuth';
import { addressText, isPickup } from '@/features/common/address';
import { formatDateTime, formatPaise, humanize } from '@/features/common/format';
import { formatPhone } from '@/features/common/phone';
import { ServerEvent } from '@/features/kitchen/events';
import { headlineFor, isTerminal, statusLabel, statusTone, stepsFor } from './status';
import { useReorder } from './useReorder';

type Order = components['schemas']['OrderDto'];

const POLL_MS = 10_000;

export function useOrderTracking(id: string): OrderTrackerProps {
  const router = useRouter();
  const auth = useCustomerAuth({ title: 'Verify your number to see this order', description: 'Use the number you ordered with.' });
  const token = auth.session?.token;
  const [order, setOrder] = useState<Order | undefined>();
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<{ text: string; notFound: boolean } | undefined>();
  const [isLive, setLive] = useState(false);
  const [notice, setNotice] = useState<NoticeProps | undefined>();
  const reorder = useReorder((text) => setNotice({ kind: 'error', text, onDismiss: () => setNotice(undefined) }));
  const doneRef = useRef(false);

  const load = useCallback(async () => {
    try {
      const o = await unwrap(api.GET('/api/orders/{id}', { params: { path: { id } } }));
      setOrder(o);
      setError(undefined);
      doneRef.current = isTerminal(o.status);
    } catch (e) {
      // keep showing the last good order on a failed refresh; only a first load becomes an error screen
      setError((prev) => (order ? prev : { text: errorText(e), notFound: e instanceof ApiError && (e.status === 404 || e.status === 400) }));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!auth.isReady) return;
    if (!token) {
      setLoading(false);
      setOrder(undefined);
      return;
    }
    setLoading(true);
    doneRef.current = false;
    void load();

    // Live: the server pushes a change, we re-read the order through the normal authorised call.
    // Polling is the safety net (socket blocked, phone asleep): it stops once the order is closed.
    const socket = io(API_ORIGIN, { auth: { token }, reconnectionDelayMax: 10_000 });
    socket.on('connect', () => {
      setLive(true);
      void load();
    });
    socket.on('disconnect', () => setLive(false));
    socket.on('connect_error', () => setLive(false));
    socket.on(ServerEvent.OrderStatusChanged, (p: { order?: { id?: string } }) => {
      if (p?.order?.id === id) void load();
    });
    const poll = setInterval(() => {
      if (!doneRef.current && document.visibilityState === 'visible') void load();
    }, POLL_MS);
    const onVisible = () => document.visibilityState === 'visible' && !doneRef.current && void load();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(poll);
      document.removeEventListener('visibilitychange', onVisible);
      socket.removeAllListeners();
      socket.disconnect();
      setLive(false);
    };
  }, [auth.isReady, token, id, load]);

  const base: OrderTrackerProps = {
    backButton: { label: 'All my orders', onClick: () => router.push('/orders') },
    isLoading: !auth.isReady || (!!token && isLoading),
    loadingLabel: 'Loading your order',
    notice,
    verify: auth.isReady && !auth.isSignedIn ? auth.otpPanel : undefined,
  };
  if (error && !order) {
    return { ...base, message: { text: error.notFound ? 'We can’t find this order on your number.' : error.text, actionLabel: error.notFound ? 'Go to my orders' : 'Try again', onAction: error.notFound ? () => router.push('/orders') : () => void load() } };
  }
  if (!order) return base;

  const pickup = isPickup(order);
  const { headline, detail } = headlineFor(order);
  const done = isTerminal(order.status);
  return {
    ...base,
    live: done ? undefined : isLive ? { label: 'Live', isLive: true } : { label: 'Updating every few seconds', isLive: false },
    order: {
      title: `Order ${order.orderNumber}`,
      badge: { label: statusLabel(order), tone: statusTone(order.status) },
      headline,
      detail,
      stepsLabel: 'Order progress',
      steps: stepsFor(order).map((s) => ({ id: s.status, label: s.label, timeLabel: s.at ? formatDateTime(s.at) : undefined, state: s.state, stateLabel: s.state === 'done' ? 'done' : s.state === 'current' ? 'now' : 'to do' })),
      detailsTitle: 'Order details',
      info: [
        { label: 'Placed', value: formatDateTime(order.createdAt) },
        { label: pickup ? 'Pickup' : 'Delivery', value: pickup ? 'Collect from the shop' : addressText(order, true) || '—' },
        { label: 'Name', value: order.contactName },
        { label: 'Phone', value: formatPhone(order.contactPhone) },
        { label: 'Payment', value: order.paymentMethod === 'cod' ? `Cash, ${humanize(order.paymentStatus).toLowerCase()}` : humanize(order.paymentStatus) },
        ...(order.customerNote ? [{ label: 'Your note', value: order.customerNote }] : []),
      ],
      items: order.lines.map((l, i) => ({ id: `${l.menuItemId}-${i}`, name: l.name, quantityLabel: String(l.quantity), optionsText: l.options.length ? l.options.map((o) => o.name).join(', ') : undefined, note: l.note, priceLabel: formatPaise(l.lineTotalPaise) })),
      rows: [
        { label: 'Subtotal', value: formatPaise(order.subtotalPaise) },
        { label: pickup ? 'Pickup' : 'Delivery fee', value: order.deliveryFeePaise === 0 ? 'Free' : formatPaise(order.deliveryFeePaise) },
        { label: 'Total', value: formatPaise(order.totalPaise), isStrong: true },
      ],
      reorderButton: { label: 'Order again', onClick: () => void reorder.reorder(order), isLoading: reorder.busyId === order.id },
    },
  };
}
