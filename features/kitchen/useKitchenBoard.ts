'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { KitchenBoardProps } from '@/ui/kitchen/KitchenBoard';
import type { NoticeProps } from '@/ui/common/Notice';
import { OrderStatus } from '@/types/enums';
import { API_ORIGIN, api, errorText, unwrap } from '@/features/api/client';
import { clearSession, loadSession } from '@/features/auth/session';
import { STAFF_LOGIN_PATH } from '@/features/auth/access';
import { ServerEvent } from './events';
import { ACTIVE_STATUSES, COLUMNS, columnOf, toCardProps, upsert, type Order } from './queue';
import { enableSound, playNewOrderAlert } from './sound';
import { useAvailability } from './useAvailability';

const TICK_MS = 30_000;

export function useKitchenBoard(): KitchenBoardProps {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isLive, setLive] = useState(false);
  const [notice, setNotice] = useState<NoticeProps | undefined>();
  const [soundOn, setSoundOn] = useState(false);
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(() => Date.now());
  const [reject, setReject] = useState<{ order: Order; reason: string; error?: string; busy: boolean } | null>(null);

  // Refs so the socket handlers (registered once) always see current values.
  const soundRef = useRef(false);
  const knownRef = useRef<Set<string>>(new Set());
  soundRef.current = soundOn;

  const showError = useCallback((text: string) => setNotice({ kind: 'error', text, onDismiss: () => setNotice(undefined) }), []);
  const availability = useAvailability(showError);

  const alertIfSound = useCallback(() => {
    if (soundRef.current) playNewOrderAlert();
  }, []);

  const refetch = useCallback(async () => {
    try {
      const list = await unwrap(api.GET('/api/orders', { params: { query: { statuses: ACTIVE_STATUSES, limit: 100 } } }));
      const fresh = list.filter((o) => o.status === OrderStatus.Placed && !knownRef.current.has(o.id));
      list.forEach((o) => knownRef.current.add(o.id));
      setOrders(list.filter((o) => columnOf(o.status)).sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
      if (fresh.length && knownRef.current.size > fresh.length) alertIfSound(); // missed while offline
    } catch (e) {
      showError(errorText(e));
    } finally {
      setLoading(false);
    }
  }, [alertIfSound, showError]);

  // clock for "x min ago" and Delayed flags
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(t);
  }, []);

  // initial load + realtime
  useEffect(() => {
    void refetch();
    const session = loadSession();
    if (!session) return;
    const socket: Socket = io(API_ORIGIN, { auth: { token: session.token }, reconnectionDelayMax: 10_000 });

    socket.on('connect', () => {
      setLive(true);
      void refetch(); // catch anything that happened while disconnected
    });
    socket.on('disconnect', () => setLive(false));
    socket.on('connect_error', () => setLive(false));
    socket.on(ServerEvent.OrderCreated, ({ order }: { order: Order }) => {
      const isNew = !knownRef.current.has(order.id);
      knownRef.current.add(order.id);
      setOrders((l) => upsert(l, order));
      if (isNew && order.status === OrderStatus.Placed) alertIfSound();
    });
    socket.on(ServerEvent.OrderStatusChanged, ({ order }: { order: Order }) => {
      knownRef.current.add(order.id);
      setOrders((l) => upsert(l, order));
    });
    socket.on(ServerEvent.AuthExpired, () => {
      clearSession();
      window.location.assign(STAFF_LOGIN_PATH);
    });
    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [refetch, alertIfSound]);

  const setBusyId = (id: string, on: boolean) =>
    setBusy((b) => {
      const n = new Set(b);
      if (on) n.add(id);
      else n.delete(id);
      return n;
    });

  const transition = async (order: Order, status: OrderStatus, reason?: string) => {
    setBusyId(order.id, true);
    try {
      const updated = await unwrap(api.PATCH('/api/orders/{id}/status', { params: { path: { id: order.id } }, body: { status, ...(reason ? { reason } : {}) } }));
      setOrders((l) => upsert(l, updated));
      return true;
    } catch (e) {
      showError(`${order.orderNumber}: ${errorText(e)}`);
      void refetch(); // someone else may have changed it; show the truth
      return false;
    } finally {
      setBusyId(order.id, false);
    }
  };

  const confirmReject = async () => {
    if (!reject) return;
    const reason = reject.reason.trim();
    if (reason.length < 3) return setReject({ ...reject, error: 'Give a short reason (at least 3 characters).' });
    setReject({ ...reject, busy: true, error: undefined });
    const done = await transition(reject.order, OrderStatus.Rejected, reason);
    setReject(done ? null : (r) => (r ? { ...r, busy: false } : r));
  };

  const toggleSound = async () => {
    if (soundOn) return setSoundOn(false);
    const ok = await enableSound();
    if (!ok) return showError('This browser blocked sound. Tap the page once and try again.');
    setSoundOn(true);
    playNewOrderAlert(); // audible confirmation
  };

  return {
    title: 'Kitchen queue',
    connection: isLive ? { label: 'Live', isLive: true } : { label: 'Reconnecting…', isLive: false },
    sound: { label: soundOn ? '🔔 Sound on' : '🔇 Sound off: tap to enable', isOn: soundOn, onToggle: () => void toggleSound() },
    availabilityButton: { label: 'Sold-out items', onClick: () => void availability.open() },
    notice,
    isLoading,
    columns: COLUMNS.map((c) => {
      const inCol = orders.filter((o) => columnOf(o.status) === c.id);
      return {
        id: c.id,
        title: c.title,
        count: inCol.length,
        emptyText: c.empty,
        cards: inCol.map((o) => toCardProps(o, now, busy.has(o.id), { onAdvance: (to) => void transition(o, to), onReject: () => setReject({ order: o, reason: '', busy: false }) })),
      };
    }),
    rejectDialog: reject
      ? {
          title: 'Reject order',
          orderLabel: `${reject.order.orderNumber} · ${reject.order.contactName}`,
          reason: reject.reason,
          errorMessage: reject.error,
          isBusy: reject.busy,
          onReasonChange: (v) => setReject((r) => (r ? { ...r, reason: v, error: undefined } : r)),
          onConfirm: () => void confirmReject(),
          onCancel: () => setReject(null),
        }
      : undefined,
    availabilityPanel: availability.panel,
  };
}
