'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import type { components } from '@/types/api';
import { OrderStatus, PaymentStatus, Role } from '@/types/enums';
import type { OrdersAdminViewProps } from '@/ui/orders-admin/OrdersAdminView';
import type { OrderDetailDialogProps } from '@/ui/orders-admin/OrderDetailDialog';
import type { NoticeProps } from '@/ui/common/Notice';
import { API_ORIGIN, api, errorText, unwrap } from '@/features/api/client';
import { loadSession } from '@/features/auth/session';
import { addressText, isPickup } from '@/features/common/address';
import { formatDateTime, formatPaise, humanize } from '@/features/common/format';
import { ServerEvent } from '@/features/kitchen/events';
import { advanceFor, canReject, cancelPath, needsRider, statusTone } from './mapper';

type Order = components['schemas']['OrderDto'];
type Staff = components['schemas']['UserSummaryDto'];

const ALL = 'all';
const statusOptions = [{ value: ALL, label: 'All statuses' }, ...Object.values(OrderStatus).map((s) => ({ value: s, label: humanize(s) }))];
const paymentOptions = [{ value: ALL, label: 'Any payment' }, ...Object.values(PaymentStatus).map((s) => ({ value: s, label: humanize(s) }))];

const startOfDayIso = (d: string) => new Date(`${d}T00:00:00`).toISOString();
const nextDayIso = (d: string) => {
  const x = new Date(`${d}T00:00:00`);
  x.setDate(x.getDate() + 1);
  return x.toISOString();
};

type Detail = { id: string; reason: string; riderId: string; overrideStatus: string; overrideRiderId: string; error?: string; busy: boolean };

export function useOrdersAdmin(): OrdersAdminViewProps {
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [notice, setNotice] = useState<NoticeProps | undefined>();
  const [status, setStatus] = useState(ALL);
  const [payment, setPayment] = useState(ALL);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [detail, setDetail] = useState<Detail | null>(null);
  const [tick, setTick] = useState(0); // bump = refetch

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    unwrap(
      api.GET('/api/orders', {
        params: {
          query: {
            limit: 100,
            ...(status !== ALL ? { status: status as OrderStatus } : {}),
            ...(payment !== ALL ? { paymentStatus: payment as PaymentStatus } : {}),
            ...(debouncedSearch ? { search: debouncedSearch } : {}),
            ...(from ? { from: startOfDayIso(from) } : {}),
            ...(to ? { to: nextDayIso(to) } : {}),
          },
        },
      }),
    )
      .then((list) => !cancelled && setOrders(list))
      .catch((e) => !cancelled && setNotice({ kind: 'error', text: errorText(e), onDismiss: () => setNotice(undefined) }))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [status, payment, debouncedSearch, from, to, tick]);

  useEffect(() => {
    unwrap(api.GET('/api/admin/staff')).then(setStaff).catch((e) => setNotice({ kind: 'error', text: errorText(e), onDismiss: () => setNotice(undefined) }));
  }, []);

  // live: any order event -> refetch (debounced). Keeps filters honest without client-side re-filtering.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const session = loadSession();
    if (!session) return;
    const socket = io(API_ORIGIN, { auth: { token: session.token } });
    const poke = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setTick((n) => n + 1), 800);
    };
    socket.on(ServerEvent.OrderCreated, poke);
    socket.on(ServerEvent.OrderStatusChanged, poke);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  const riders = useMemo(() => staff.filter((s) => s.role === Role.Rider && s.isActive), [staff]);
  const riderName = useCallback((id?: string) => (id ? (staff.find((s) => s.id === id)?.name ?? 'Rider') : 'Unassigned'), [staff]);
  const riderOptions = useMemo(() => [{ value: '', label: riders.length ? 'Choose a rider…' : 'No active riders' }, ...riders.map((r) => ({ value: r.id, label: r.name ?? r.username ?? r.id }))], [riders]);

  const current = detail ? orders.find((o) => o.id === detail.id) : undefined;

  const run = async (label: string, call: () => Promise<Order>) => {
    if (!detail) return;
    setDetail({ ...detail, busy: true, error: undefined });
    try {
      const updated = await call();
      setOrders((l) => l.map((o) => (o.id === updated.id ? updated : o)));
      setNotice({ kind: 'success', text: `${updated.orderNumber}: ${label}`, onDismiss: () => setNotice(undefined) });
      setDetail((d) => (d ? { ...d, busy: false, reason: '', overrideStatus: '', overrideRiderId: '' } : d));
    } catch (e) {
      setDetail((d) => (d ? { ...d, busy: false, error: errorText(e) } : d));
      setTick((n) => n + 1);
    }
  };

  const patchStatus = (o: Order, st: OrderStatus, extra: { reason?: string; riderId?: string } = {}) =>
    unwrap(api.PATCH('/api/orders/{id}/status', { params: { path: { id: o.id } }, body: { status: st, ...(extra.reason ? { reason: extra.reason } : {}), ...(extra.riderId ? { riderId: extra.riderId } : {}) } }));

  const detailProps = (o: Order, d: Detail): OrderDetailDialogProps => {
    const reason = d.reason.trim();
    const needReason = (what: string, fn: () => void) => () => (reason.length < 3 ? setDetail({ ...d, error: `Write a reason (3+ characters) to ${what}.` }) : fn());

    const actions: OrderDetailDialogProps['actions'] = [];
    const adv = advanceFor(o);
    if (adv) actions.push({ label: adv.label, variant: 'primary', onClick: () => void run(adv.label, () => patchStatus(o, adv.to)) });
    if (canReject(o.status)) actions.push({ label: 'Reject', variant: 'danger', onClick: needReason('reject', () => void run('rejected', () => patchStatus(o, OrderStatus.Rejected, { reason }))) });
    const cp = cancelPath(o.status);
    if (cp === 'normal') actions.push({ label: 'Cancel order', variant: 'danger', onClick: needReason('cancel', () => void run('cancelled', () => patchStatus(o, OrderStatus.Cancelled, { reason }))) });
    if (cp === 'override') actions.push({ label: 'Cancel order', variant: 'danger', onClick: needReason('cancel', () => void run('cancelled', () => unwrap(api.PATCH('/api/orders/{id}/override', { params: { path: { id: o.id } }, body: { status: OrderStatus.Cancelled, reason } })))) });

    const wantsRider = d.overrideStatus !== '' && needsRider(d.overrideStatus) && !o.riderId;

    return {
      title: `Order ${o.orderNumber}`,
      badge: { label: humanize(o.status), tone: statusTone(o.status) },
      info: [
        { label: 'Placed', value: formatDateTime(o.createdAt) },
        { label: 'Customer', value: `${o.contactName} · ${o.contactPhone}` },
        isPickup(o) ? { label: 'Pickup', value: 'Customer collects at the shop' } : { label: 'Address', value: addressText(o, true) || '—' },
        { label: 'Charges', value: `Items ${formatPaise(o.subtotalPaise)} + delivery ${o.deliveryFeePaise ? formatPaise(o.deliveryFeePaise) : 'free'}` },
        { label: 'Payment', value: `${o.paymentMethod === 'cod' ? 'Cash on delivery' : o.paymentMethod} · ${humanize(o.paymentStatus)}` },
        { label: 'Rider', value: riderName(o.riderId) },
      ],
      lines: o.lines.map((l, i) => ({
        id: `${l.menuItemId}-${i}`,
        text: `${l.quantity} × ${l.name}${l.options.length ? ` (${l.options.map((x) => x.name).join(', ')})` : ''}${l.note ? ` — ${l.note}` : ''}`,
        amountLabel: formatPaise(l.lineTotalPaise),
      })),
      totalLabel: formatPaise(o.totalPaise),
      customerNote: o.customerNote,
      log: [...o.statusLog].reverse().map((e, i) => ({ id: `${e.at}-${i}`, text: `${formatDateTime(e.at)} · ${e.from ? humanize(e.from) : 'Created'} → ${humanize(e.to)} · ${humanize(e.byRole)}${e.reason ? ` — ${e.reason}` : ''}` })),
      errorMessage: d.error,
      isBusy: d.busy,
      actions,
      reason: { value: d.reason, onChange: (v) => setDetail({ ...d, reason: v, error: undefined }), hint: 'Needed for Reject, Cancel and Override. Logged with the order.' },
      assign:
        o.status === OrderStatus.Ready && !isPickup(o)
          ? {
              label: 'Assign rider',
              riderOptions,
              value: d.riderId,
              onChange: (v) => setDetail({ ...d, riderId: v, error: undefined }),
              onSubmit: () => void run('rider assigned', () => patchStatus(o, OrderStatus.Assigned, { riderId: d.riderId })),
            }
          : undefined,
      override: {
        heading: 'Admin override (skips the normal flow)',
        statusOptions: [{ value: '', label: 'Choose a status…' }, ...Object.values(OrderStatus).filter((s) => s !== o.status).map((s) => ({ value: s, label: humanize(s) }))],
        status: d.overrideStatus,
        onStatusChange: (v) => setDetail({ ...d, overrideStatus: v, overrideRiderId: '', error: undefined }),
        riderPicker: wantsRider ? { options: riderOptions, value: d.overrideRiderId, onChange: (v) => setDetail({ ...d, overrideRiderId: v, error: undefined }) } : undefined,
        onSubmit: needReason('override', () => {
          if (wantsRider && !d.overrideRiderId) return setDetail({ ...d, error: 'Choose a rider for this status.' });
          void run(`set to ${humanize(d.overrideStatus)}`, () =>
            unwrap(api.PATCH('/api/orders/{id}/override', { params: { path: { id: o.id } }, body: { status: d.overrideStatus as OrderStatus, reason, ...(wantsRider ? { riderId: d.overrideRiderId } : {}) } })),
          );
        }),
      },
      onClose: () => setDetail(null),
    };
  };

  const clear = () => {
    setStatus(ALL);
    setPayment(ALL);
    setSearch('');
    setFrom('');
    setTo('');
  };

  return {
    title: 'Orders',
    notice,
    isLoading,
    filters: {
      status: { value: status, options: statusOptions, onChange: setStatus },
      payment: { value: payment, options: paymentOptions, onChange: setPayment },
      search: { value: search, onChange: setSearch },
      from: { value: from, onChange: setFrom },
      to: { value: to, onChange: setTo },
      onClear: clear,
    },
    countLabel: orders.length >= 100 ? 'Showing the newest 100. Narrow the filters to see older ones.' : `${orders.length} order${orders.length === 1 ? '' : 's'}`,
    emptyText: 'No orders match these filters.',
    rows: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      whenLabel: formatDateTime(o.createdAt),
      customerLabel: o.contactName,
      totalLabel: formatPaise(o.totalPaise),
      badge: { label: humanize(o.status), tone: statusTone(o.status) },
      paymentLabel: humanize(o.paymentStatus),
      riderLabel: riderName(o.riderId),
      onOpen: () => setDetail({ id: o.id, reason: '', riderId: '', overrideStatus: '', overrideRiderId: '', busy: false }),
    })),
    onRefresh: () => setTick((n) => n + 1),
    detail: detail && current ? detailProps(current, detail) : undefined,
  };
}
