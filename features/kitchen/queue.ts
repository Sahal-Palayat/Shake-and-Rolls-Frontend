import type { components } from '@/types/api';
import { OrderStatus } from '@/types/enums';
import { formatAge, formatPaise, humanize, minutesSince } from '@/features/common/format';
import { addressText, isPickup } from '@/features/common/address';
import { advanceFor } from '@/features/orders-admin/mapper';
import type { OrderCardProps } from '@/ui/kitchen/OrderCard';

export type Order = components['schemas']['OrderDto'];
export type ColumnId = 'new' | 'preparing' | 'ready';

/** What the board shows. picked_up and later leave the screen. */
export const ACTIVE_STATUSES: OrderStatus[] = [OrderStatus.Placed, OrderStatus.Accepted, OrderStatus.Preparing, OrderStatus.Ready, OrderStatus.Assigned];

/** Minutes an order may sit in a state before it is flagged Delayed. Display only. */
export const DELAY_AFTER_MIN: Partial<Record<OrderStatus, number>> = {
  [OrderStatus.Placed]: 5,
  [OrderStatus.Accepted]: 10,
  [OrderStatus.Preparing]: 20,
  [OrderStatus.Ready]: 10,
};

export const COLUMNS: { id: ColumnId; title: string; empty: string }[] = [
  { id: 'new', title: 'New', empty: 'No new orders' },
  { id: 'preparing', title: 'Preparing', empty: 'Nothing cooking' },
  { id: 'ready', title: 'Ready', empty: 'Nothing waiting' },
];

export function columnOf(status: string): ColumnId | null {
  switch (status) {
    case OrderStatus.Placed:
      return 'new';
    case OrderStatus.Accepted:
    case OrderStatus.Preparing:
      return 'preparing';
    case OrderStatus.Ready:
    case OrderStatus.Assigned:
      return 'ready';
    default:
      return null;
  }
}

/** Insert/replace an order, or drop it if it left the active set. Oldest first (FIFO). */
export function upsert(list: Order[], order: Order): Order[] {
  const rest = list.filter((o) => o.id !== order.id);
  if (columnOf(order.status) === null) return rest;
  return [...rest, order].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function enteredStateAt(o: Order): string {
  return o.statusLog.length ? o.statusLog[o.statusLog.length - 1].at : o.createdAt;
}

export function isDelayed(o: Order, nowMs: number): boolean {
  const limit = DELAY_AFTER_MIN[o.status as OrderStatus];
  return limit !== undefined && minutesSince(enteredStateAt(o), nowMs) >= limit;
}

const STATE_LABEL: Record<string, string> = {
  [OrderStatus.Placed]: 'New',
  [OrderStatus.Accepted]: 'Accepted',
  [OrderStatus.Preparing]: 'Preparing',
  [OrderStatus.Ready]: 'Ready for rider',
  [OrderStatus.Assigned]: 'Rider assigned',
};

export type CardHandlers = { onAdvance: (to: OrderStatus) => void; onReject: () => void };

export function toCardProps(o: Order, nowMs: number, isBusy: boolean, h: CardHandlers): OrderCardProps {
  const delayed = isDelayed(o, nowMs);
  const pickup = isPickup(o);
  const base = pickup && o.status === OrderStatus.Ready ? 'Ready for pickup' : (STATE_LABEL[o.status] ?? humanize(o.status));
  const tone = o.status === OrderStatus.Placed ? 'new' : o.status === OrderStatus.Ready || o.status === OrderStatus.Assigned ? 'ready' : 'preparing';

  const actions: OrderCardProps['actions'] = [];
  if (o.status === OrderStatus.Placed) {
    actions.push({ label: 'Accept', variant: 'primary', onClick: () => h.onAdvance(OrderStatus.Accepted) });
    actions.push({ label: 'Reject', variant: 'danger', onClick: h.onReject });
  } else if (o.status === OrderStatus.Accepted) {
    actions.push({ label: 'Start preparing', variant: 'primary', onClick: () => h.onAdvance(OrderStatus.Preparing) });
  } else if (o.status === OrderStatus.Preparing) {
    actions.push({ label: 'Mark ready', variant: 'primary', onClick: () => h.onAdvance(OrderStatus.Ready) });
  } else if (pickup && o.status === OrderStatus.Ready) {
    const adv = advanceFor(o);
    if (adv) actions.push({ label: adv.label, variant: 'primary', onClick: () => h.onAdvance(adv.to) });
  }

  return {
    id: o.id,
    orderNumber: o.orderNumber,
    ageLabel: formatAge(o.createdAt, nowMs),
    badge: delayed ? { label: `Delayed · ${base}`, tone: 'delayed' } : { label: base, tone },
    isDelayed: delayed,
    customerLabel: o.contactName,
    fulfillmentLabel: pickup ? 'Pickup' : 'Delivery',
    isPickup: pickup,
    addressLabel: pickup ? 'Customer collects at the shop' : addressText(o),
    lines: o.lines.map((l, i) => ({
      id: `${l.menuItemId}-${i}`,
      text: `${l.quantity} × ${l.name}`,
      optionsText: l.options.length ? l.options.map((x) => x.name).join(', ') : undefined,
      note: l.note,
    })),
    customerNote: o.customerNote,
    customerNoteLabel: 'Customer note',
    totalLabel: formatPaise(o.totalPaise),
    paymentLabel: o.paymentMethod === 'cod' ? `${pickup ? 'Cash at pickup' : 'Cash on delivery'} · ${humanize(o.paymentStatus)}` : humanize(o.paymentStatus),
    isBusy,
    actions,
  };
}
