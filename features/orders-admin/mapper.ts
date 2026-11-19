import { Fulfillment, OrderStatus } from '@/types/enums';
import type { StatusTone } from '@/ui/common/StatusBadge';

/** DISPLAY HINTS ONLY. Which buttons to show. The API decides what is actually legal and answers 409/403 otherwise. */

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

export const ADVANCE: Partial<Record<string, { to: OrderStatus; label: string }>> = {
  [OrderStatus.Placed]: { to: OrderStatus.Accepted, label: 'Accept' },
  [OrderStatus.Accepted]: { to: OrderStatus.Preparing, label: 'Start preparing' },
  [OrderStatus.Preparing]: { to: OrderStatus.Ready, label: 'Mark ready' },
  [OrderStatus.Assigned]: { to: OrderStatus.PickedUp, label: 'Mark picked up' },
  [OrderStatus.PickedUp]: { to: OrderStatus.Delivered, label: 'Mark delivered' },
};

/** The next button for an order. Pickup orders have no rider: the kitchen hands them over (ready -> delivered). */
export function advanceFor(o: { status: string; fulfillment?: string }): { to: OrderStatus; label: string } | undefined {
  if (o.fulfillment === Fulfillment.Pickup && o.status === OrderStatus.Ready) return { to: OrderStatus.Delivered, label: 'Handed over' };
  return ADVANCE[o.status];
}

export const CLOSED = new Set<string>([OrderStatus.Delivered, OrderStatus.Rejected, OrderStatus.Cancelled]);

export const canReject = (status: string) => status === OrderStatus.Placed;

/** 'normal' = regular transition is legal; 'override' = needs the admin override; null = already closed. */
export function cancelPath(status: string): 'normal' | 'override' | null {
  if (CLOSED.has(status)) return null;
  return status === OrderStatus.Placed || status === OrderStatus.Accepted ? 'normal' : 'override';
}

export const needsRider = (to: string) => to === OrderStatus.Assigned || to === OrderStatus.PickedUp || to === OrderStatus.Delivered;
