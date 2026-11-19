import type { components } from '@/types/api';
import { OrderStatus, PaymentStatus } from '@/types/enums';
import { addressText } from '@/features/common/address';

export type Order = components['schemas']['OrderDto'];

/** What a rider works on. Everything else is either not theirs yet (ready) or finished. */
export const ACTIVE_STATUSES: OrderStatus[] = [OrderStatus.Assigned, OrderStatus.PickedUp];

export type RiderAction = { to: OrderStatus; label: string; needsCash: boolean };

/**
 * DISPLAY HINT ONLY: which button the rider sees. The API decides what is legal (409/403) and what the cash must be.
 * Delivering a COD order that has not been settled asks for the cash first.
 */
export function riderAction(o: Pick<Order, 'status' | 'paymentMethod' | 'paymentStatus'>): RiderAction | undefined {
  if (o.status === OrderStatus.Assigned) return { to: OrderStatus.PickedUp, label: 'Picked up', needsCash: false };
  if (o.status === OrderStatus.PickedUp) {
    const cashDue = o.paymentMethod === 'cod' && o.paymentStatus !== PaymentStatus.CodCollected;
    return { to: OrderStatus.Delivered, label: 'Delivered', needsCash: cashDue };
  }
  return undefined;
}

/** Food already in the rider's hands first, then oldest first. */
export function sortActive(list: Order[]): Order[] {
  const rank = (o: Order) => (o.status === OrderStatus.PickedUp ? 0 : 1);
  return [...list].sort((a, b) => rank(a) - rank(b) || a.createdAt.localeCompare(b.createdAt));
}

/** tel: link, or undefined when there is no usable number. */
export function telHref(phone: string | undefined): string | undefined {
  const digits = (phone ?? '').replace(/[^\d+]/g, '');
  return digits.replace(/\D/g, '').length >= 7 ? `tel:${digits}` : undefined;
}

/** Opens the address in the phone's Maps app / Google Maps. We store no coordinates, so it searches the address text. */
export function mapsHref(o: Pick<Order, 'fulfillment' | 'deliveryAddress'>): string | undefined {
  const text = addressText(o, true);
  return text ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}` : undefined;
}

/** "230", "230.5", "₹1,230.50" -> paise. null when it is not a plain amount with at most 2 decimals. No float maths. */
export function parseRupees(input: string): number | null {
  const t = input.replace(/[₹,\s]/g, '');
  const m = /^(\d{1,7})(?:\.(\d{1,2}))?$/.exec(t);
  if (!m) return null;
  return Number(m[1]) * 100 + Number((m[2] ?? '').padEnd(2, '0'));
}

/** Local hint before we call the API. The server has the final say. */
export function cashProblem(input: string, totalPaise: number, fmt: (paise: number) => string): string | undefined {
  if (!input.trim()) return 'Enter the amount you collected.';
  const paise = parseRupees(input);
  if (paise === null) return 'Enter an amount like 230 or 230.50.';
  if (paise !== totalPaise) return `Amount due is ${fmt(totalPaise)}. Collect exactly that.`;
  return undefined;
}

/** `next` after login: only paths inside the rider app, never another site. */
export function safeRiderNext(next: string | null | undefined): string {
  if (next && (next === '/rider' || next.startsWith('/rider/')) && !next.startsWith('/rider/login')) return next;
  return '/rider';
}
