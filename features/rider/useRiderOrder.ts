import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { RiderOrderProps } from '@/ui/rider/RiderOrder';
import type { NoticeProps } from '@/ui/common/Notice';
import { OrderStatus, PaymentStatus } from '@/types/enums';
import { ApiError, api, errorText, unwrap } from '@/features/api/client';
import { addressText, isPickup } from '@/features/common/address';
import { formatDateTime, formatPaise, humanize } from '@/features/common/format';
import { statusTone } from '@/features/orders-admin/mapper';
import { cashProblem, mapsHref, parseRupees, riderAction, telHref, type Order } from './rider';
import { useLiveRefresh } from './useLiveRefresh';

export function useRiderOrder(id: string): RiderOrderProps {
  const router = useRouter();
  const [order, setOrder] = useState<Order | undefined>();
  const [isLoading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<{ text: string; notFound: boolean } | undefined>();
  const [notice, setNotice] = useState<NoticeProps | undefined>();
  const [busy, setBusy] = useState(false);
  const [cashOpen, setCashOpen] = useState(false);
  const [cash, setCash] = useState('');
  const [cashError, setCashError] = useState<string | undefined>();

  const load = useCallback(async () => {
    try {
      const o = await unwrap(api.GET('/api/orders/{id}', { params: { path: { id } } }));
      setOrder(o);
      setLoadError(undefined);
    } catch (e) {
      // 404 also covers "not assigned to you": the API does not confirm other riders' orders exist.
      setLoadError((prev) => (order ? prev : { text: errorText(e), notFound: e instanceof ApiError && (e.status === 404 || e.status === 400) }));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);
  const isLive = useLiveRefresh(() => void load());

  const back = () => router.push('/rider');
  const dismiss = () => setNotice(undefined);

  const send = async (o: Order, to: OrderStatus, cashCollectedPaise?: number) => {
    if (busy) return; // double-tap guard
    setBusy(true);
    setNotice(undefined);
    try {
      const updated = await unwrap(
        api.PATCH('/api/orders/{id}/status', {
          params: { path: { id: o.id } },
          body: { status: to, ...(cashCollectedPaise !== undefined ? { cashCollectedPaise } : {}) },
        }),
      );
      setOrder(updated);
      setCashOpen(false);
      setCash('');
      setCashError(undefined);
      setNotice({ kind: 'success', text: to === OrderStatus.Delivered ? `${updated.orderNumber} delivered. Well done!` : `${updated.orderNumber} picked up. Safe ride!`, onDismiss: dismiss });
    } catch (e) {
      setNotice({ kind: 'error', text: errorText(e), onDismiss: dismiss });
      void load(); // 409 = somebody changed it: show the truth
    } finally {
      setBusy(false);
    }
  };

  const view = (o: Order): NonNullable<RiderOrderProps['order']> => {
    const act = riderAction(o);
    const pickup = isPickup(o);
    const address = addressText(o, true);
    const cashDue = o.paymentMethod === 'cod' && o.paymentStatus !== PaymentStatus.CodCollected;
    const tel = telHref(o.contactPhone);
    const maps = mapsHref(o);

    const confirmCash = () => {
      const problem = cashProblem(cash, o.totalPaise, formatPaise);
      if (problem) return setCashError(problem);
      void send(o, OrderStatus.Delivered, parseRupees(cash)!);
    };

    return {
      title: `Order ${o.orderNumber}`,
      badge: { label: humanize(o.status), tone: statusTone(o.status) },
      customerName: o.contactName,
      phoneLabel: o.contactPhone,
      call: tel ? { label: 'Call customer', href: tel } : undefined,
      addressLabel: pickup ? 'Pickup order: no delivery needed' : address || 'No address on this order',
      maps: maps ? { label: 'Open in Maps', href: maps } : undefined,
      customerNote: o.customerNote,
      customerNoteLabel: 'Customer note',
      itemsTitle: 'Items',
      lines: o.lines.map((l, i) => ({
        id: `${l.menuItemId}-${i}`,
        text: `${l.quantity} × ${l.name}`,
        optionsText: l.options.length ? l.options.map((x) => x.name).join(', ') : undefined,
        note: l.note,
      })),
      payment: {
        title: 'Payment',
        totalLabel: formatPaise(o.totalPaise),
        statusLabel: o.paymentMethod === 'cod' ? (cashDue ? 'Cash on delivery' : 'Cash collected') : humanize(o.paymentStatus),
        isCashDue: cashDue,
        dueLabel: cashDue ? `Collect ${formatPaise(o.totalPaise)} in cash` : undefined,
        collectedLabel: o.cashCollectedPaise !== undefined ? `You collected ${formatPaise(o.cashCollectedPaise)}` : undefined,
      },
      placedLabel: `Placed ${formatDateTime(o.createdAt)}`,
      action: act && !cashOpen ? { label: act.label, isBusy: busy, onClick: () => (act.needsCash ? setCashOpen(true) : void send(o, act.to)) } : undefined,
      cashPanel:
        act && cashOpen
          ? {
              title: 'Cash collected',
              dueLabel: `Amount due: ${formatPaise(o.totalPaise)}`,
              field: {
                id: 'cash-collected',
                label: 'Cash you collected (₹)',
                inputMode: 'decimal',
                autoComplete: 'off',
                placeholder: String(o.totalPaise / 100),
                value: cash,
                onChange: (v) => {
                  setCash(v);
                  setCashError(undefined);
                },
                errorMessage: cashError,
                isDisabled: busy,
              },
              confirmLabel: 'Confirm delivered',
              isBusy: busy,
              onConfirm: confirmCash,
              cancelLabel: 'Back',
              onCancel: () => {
                setCashOpen(false);
                setCashError(undefined);
              },
            }
          : undefined,
      isClosed: !act,
      closedLabel: closedText(o.status),
      backToListLabel: 'Back to my orders',
    };
  };

  return {
    backButton: { label: '‹ My orders', onClick: back },
    isLoading,
    loadingLabel: 'Loading the order',
    notice,
    live: { label: isLive ? 'Live' : 'Updating every 15 s', isLive },
    message: loadError
      ? { text: loadError.notFound ? 'This order is not assigned to you, or does not exist.' : loadError.text, actionLabel: loadError.notFound ? 'Back to my orders' : 'Try again', onAction: loadError.notFound ? back : () => void load() }
      : undefined,
    order: order ? view(order) : undefined,
  };
}

function closedText(status: string): string {
  switch (status) {
    case OrderStatus.Delivered:
      return 'Delivered. Nothing more to do.';
    case OrderStatus.Cancelled:
    case OrderStatus.Rejected:
      return 'This order was cancelled. Do not deliver it.';
    case OrderStatus.Ready:
    case OrderStatus.Preparing:
    case OrderStatus.Accepted:
    case OrderStatus.Placed:
      return 'This order is not yet with you.';
    default:
      return '';
  }
}
