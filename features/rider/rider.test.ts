import { describe, expect, it } from 'vitest';
import { OrderStatus, PaymentStatus } from '@/types/enums';
import { cashProblem, mapsHref, parseRupees, riderAction, safeRiderNext, sortActive, telHref } from './rider';

const fmt = (p: number) => `₹${p / 100}`;
const o = (status: string, extra: Record<string, unknown> = {}) =>
  ({ id: status, status, paymentMethod: 'cod', paymentStatus: PaymentStatus.CodPending, fulfillment: 'delivery', createdAt: '2026-01-01T10:00:00Z', ...extra }) as never;

describe('riderAction', () => {
  it('assigned -> Picked up, no cash', () => expect(riderAction(o(OrderStatus.Assigned))).toEqual({ to: OrderStatus.PickedUp, label: 'Picked up', needsCash: false }));
  it('picked up + COD -> Delivered asks for cash', () => expect(riderAction(o(OrderStatus.PickedUp))).toMatchObject({ to: OrderStatus.Delivered, needsCash: true }));
  it('picked up + already settled -> no cash step', () => expect(riderAction(o(OrderStatus.PickedUp, { paymentStatus: PaymentStatus.CodCollected }))?.needsCash).toBe(false));
  it('nothing for ready / delivered / closed', () => {
    for (const s of [OrderStatus.Ready, OrderStatus.Delivered, OrderStatus.Cancelled]) expect(riderAction(o(s))).toBeUndefined();
  });
});

describe('sortActive', () => {
  it('picked up first, then oldest first', () => {
    const list = [o(OrderStatus.Assigned, { id: 'a2', createdAt: '2026-01-01T12:00:00Z' }), o(OrderStatus.PickedUp, { id: 'p', createdAt: '2026-01-01T13:00:00Z' }), o(OrderStatus.Assigned, { id: 'a1', createdAt: '2026-01-01T11:00:00Z' })];
    expect(sortActive(list).map((x) => x.id)).toEqual(['p', 'a1', 'a2']);
  });
});

describe('links', () => {
  it('tel strips formatting and keeps +', () => expect(telHref('+91 98765-43210')).toBe('tel:+919876543210'));
  it('tel is undefined for junk', () => {
    expect(telHref('')).toBeUndefined();
    expect(telHref(undefined)).toBeUndefined();
    expect(telHref('12')).toBeUndefined();
  });
  it('maps encodes the address; none for pickup', () => {
    const href = mapsHref({ fulfillment: 'delivery', deliveryAddress: { line1: '12 Main Rd', area: 'Thavakkara', landmark: 'Old Bank', pincode: '670001' } } as never)!;
    expect(href.startsWith('https://www.google.com/maps/search/?api=1&query=')).toBe(true);
    expect(decodeURIComponent(href.split('query=')[1])).toBe('12 Main Rd, Thavakkara, Near Old Bank, 670001');
    expect(mapsHref({ fulfillment: 'pickup' } as never)).toBeUndefined();
  });
});

describe('parseRupees', () => {
  it('accepts plain, decimal, rupee sign and commas', () => {
    expect(parseRupees('230')).toBe(23000);
    expect(parseRupees('230.5')).toBe(23050);
    expect(parseRupees('₹1,230.05')).toBe(123005);
    expect(parseRupees(' 0 ')).toBe(0);
  });
  it('rejects junk, negatives, 3 decimals, blanks', () => {
    for (const bad of ['', 'abc', '-5', '1.234', '12.', '1e3', '1 2 3x']) expect(parseRupees(bad)).toBeNull();
  });
});

describe('cashProblem', () => {
  it('flags empty, invalid and wrong amounts; accepts the exact amount', () => {
    expect(cashProblem('', 23000, fmt)).toMatch(/Enter the amount/);
    expect(cashProblem('x', 23000, fmt)).toMatch(/like 230/);
    expect(cashProblem('200', 23000, fmt)).toMatch(/₹230/);
    expect(cashProblem('230.00', 23000, fmt)).toBeUndefined();
  });
});

describe('safeRiderNext', () => {
  it('keeps rider paths, refuses everything else', () => {
    expect(safeRiderNext('/rider/orders/abc')).toBe('/rider/orders/abc');
    for (const bad of [null, '', '/staff/kitchen', '//evil.com', 'https://evil.com', '/rider/login', '/riderx']) expect(safeRiderNext(bad)).toBe('/rider');
  });
});
