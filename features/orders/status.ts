import type { components } from '@/types/api';
import { Fulfillment, OrderStatus } from '@/types/enums';
import type { StatusTone } from '@/ui/common/StatusBadge';

type Order = components['schemas']['OrderDto'];

const DELIVERY_FLOW = [OrderStatus.Placed, OrderStatus.Accepted, OrderStatus.Preparing, OrderStatus.Ready, OrderStatus.Assigned, OrderStatus.PickedUp, OrderStatus.Delivered];
const PICKUP_FLOW = [OrderStatus.Placed, OrderStatus.Accepted, OrderStatus.Preparing, OrderStatus.Ready, OrderStatus.Delivered];

const flowOf = (o: Pick<Order, 'fulfillment'>) => (o.fulfillment === Fulfillment.Pickup ? PICKUP_FLOW : DELIVERY_FLOW);

const LABEL: Record<string, { delivery: string; pickup: string }> = {
  placed: { delivery: 'Order sent', pickup: 'Order sent' },
  accepted: { delivery: 'Accepted by the shop', pickup: 'Accepted by the shop' },
  preparing: { delivery: 'Being prepared', pickup: 'Being prepared' },
  ready: { delivery: 'Ready, waiting for a rider', pickup: 'Ready for pickup' },
  assigned: { delivery: 'Rider assigned', pickup: 'Rider assigned' },
  picked_up: { delivery: 'On the way', pickup: 'On the way' },
  delivered: { delivery: 'Delivered', pickup: 'Picked up' },
  rejected: { delivery: 'Rejected', pickup: 'Rejected' },
  cancelled: { delivery: 'Cancelled', pickup: 'Cancelled' },
};

export const isTerminal = (status: string) => status === OrderStatus.Delivered || status === OrderStatus.Rejected || status === OrderStatus.Cancelled;

export function statusLabel(o: Pick<Order, 'status' | 'fulfillment'>): string {
  const l = LABEL[o.status];
  return l ? (o.fulfillment === Fulfillment.Pickup ? l.pickup : l.delivery) : o.status;
}

export function statusTone(status: string): StatusTone {
  switch (status) {
    case OrderStatus.Placed:
      return 'new';
    case OrderStatus.Accepted:
    case OrderStatus.Preparing:
      return 'preparing';
    case OrderStatus.Ready:
    case OrderStatus.Assigned:
    case OrderStatus.PickedUp:
      return 'ready';
    default:
      return 'closed';
  }
}

const HEADLINE: Record<string, { delivery: [string, string]; pickup: [string, string] }> = {
  placed: { delivery: ['We’ve got your order', 'Waiting for the kitchen to accept it.'], pickup: ['We’ve got your order', 'Waiting for the kitchen to accept it.'] },
  accepted: { delivery: ['The kitchen accepted your order', 'It will go on the stove shortly.'], pickup: ['The kitchen accepted your order', 'It will go on the stove shortly.'] },
  preparing: { delivery: ['Your food is being made', 'Fresh and on its way to ready.'], pickup: ['Your food is being made', 'Fresh and on its way to ready.'] },
  ready: { delivery: ['Your food is ready', 'We are finding a rider to bring it.'], pickup: ['Ready for pickup', 'Come to the shop and show your order number.'] },
  assigned: { delivery: ['A rider has your order', 'They will pick it up in a moment.'], pickup: ['A rider has your order', ''] },
  picked_up: { delivery: ['On the way to you', 'Keep your phone nearby. Pay the rider in cash.'], pickup: ['On the way', ''] },
  delivered: { delivery: ['Delivered. Enjoy!', ''], pickup: ['Picked up. Enjoy!', ''] },
  rejected: { delivery: ['The shop could not take this order', ''], pickup: ['The shop could not take this order', ''] },
  cancelled: { delivery: ['This order was cancelled', ''], pickup: ['This order was cancelled', ''] },
};

/** Reason from the last log entry that closed the order. Admin overrides are internal: not shown. */
export function closeReason(o: Pick<Order, 'status' | 'statusLog'>): string | undefined {
  if (o.status !== OrderStatus.Rejected && o.status !== OrderStatus.Cancelled) return undefined;
  const last = [...o.statusLog].reverse().find((l) => l.to === o.status);
  const r = last?.reason?.trim();
  return r && !r.startsWith('[override]') ? r : undefined;
}

export function headlineFor(o: Pick<Order, 'status' | 'fulfillment' | 'statusLog'>): { headline: string; detail: string } {
  const h = HEADLINE[o.status];
  if (!h) return { headline: o.status, detail: '' };
  const [headline, detail] = o.fulfillment === Fulfillment.Pickup ? h.pickup : h.delivery;
  const reason = closeReason(o);
  return { headline, detail: reason ? `Reason: ${reason}` : detail };
}

export type Step = { status: string; label: string; state: 'done' | 'current' | 'todo'; at?: string };

/** The progress list. Delivery and pickup have different steps. A closed (rejected/cancelled) order shows how far it got, then how it ended. */
export function stepsFor(o: Pick<Order, 'status' | 'fulfillment' | 'statusLog'>): Step[] {
  const flow = flowOf(o);
  const at = (s: string) => o.statusLog.find((l) => l.to === s)?.at;
  const label = (s: string) => statusLabel({ status: s as OrderStatus, fulfillment: o.fulfillment });

  if (o.status === OrderStatus.Rejected || o.status === OrderStatus.Cancelled) {
    const reached = flow.filter((s) => at(s) && s !== o.status);
    return [...reached.map((s) => ({ status: s, label: label(s), state: 'done' as const, at: at(s) })), { status: o.status, label: label(o.status), state: 'current' as const, at: at(o.status) }];
  }
  const idx = flow.indexOf(o.status as OrderStatus);
  const finished = o.status === OrderStatus.Delivered;
  return flow.map((s, i) => ({ status: s, label: label(s), state: i < idx || finished ? 'done' : i === idx ? 'current' : 'todo', at: i <= idx ? at(s) : undefined }));
}
