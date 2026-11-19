import { describe, expect, it } from 'vitest';
import { columnOf, isDelayed, toCardProps, upsert, type Order } from './queue';

const mk = (id: string, status: string, createdAt: string, at = createdAt): Order =>
  ({ id, status, createdAt, statusLog: [{ at }] }) as unknown as Order;

describe('kitchen queue', () => {
  it('maps statuses to columns; finished statuses have none', () => {
    expect(columnOf('placed')).toBe('new');
    expect(columnOf('accepted')).toBe('preparing');
    expect(columnOf('preparing')).toBe('preparing');
    expect(columnOf('ready')).toBe('ready');
    expect(columnOf('assigned')).toBe('ready');
    for (const s of ['picked_up', 'delivered', 'rejected', 'cancelled']) expect(columnOf(s)).toBeNull();
  });
  it('upsert replaces, adds oldest-first, and drops finished orders', () => {
    let l: Order[] = [];
    l = upsert(l, mk('b', 'placed', '2026-01-01T10:05:00Z'));
    l = upsert(l, mk('a', 'placed', '2026-01-01T10:00:00Z'));
    expect(l.map((o) => o.id)).toEqual(['a', 'b']);
    l = upsert(l, mk('a', 'accepted', '2026-01-01T10:00:00Z'));
    expect(l.find((o) => o.id === 'a')?.status).toBe('accepted');
    expect(l).toHaveLength(2);
    l = upsert(l, mk('a', 'picked_up', '2026-01-01T10:00:00Z'));
    expect(l.map((o) => o.id)).toEqual(['b']);
  });
  it('delayed is measured from entering the current state', () => {
    const t0 = Date.parse('2026-01-01T10:00:00Z');
    const o = mk('x', 'placed', '2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z');
    expect(isDelayed(o, t0 + 4 * 60_000)).toBe(false);
    expect(isDelayed(o, t0 + 5 * 60_000)).toBe(true);
    expect(isDelayed(mk('y', 'assigned', '2026-01-01T09:00:00Z'), t0)).toBe(false);
  });
});

describe('pickup orders on the kitchen board', () => {
  const pk = (status: string, fulfillment: string) => ({ id: 'p', status, fulfillment, createdAt: '2026-01-01T10:00:00Z', statusLog: [{ at: '2026-01-01T10:00:00Z' }], contactName: 'Asha', lines: [], paymentMethod: 'cod', paymentStatus: 'cod_pending', totalPaise: 100, deliveryAddress: undefined }) as unknown as Order;
  const h = { onAdvance: () => {}, onReject: () => {} };

  it('ready pickup gets "Handed over" and no address', () => {
    const c = toCardProps(pk('ready', 'pickup'), 0, false, h);
    expect(c.actions.map((a) => a.label)).toEqual(['Handed over']);
    expect(c.isPickup).toBe(true);
    expect(c.badge.label).toBe('Ready for pickup');
    expect(c.addressLabel).toMatch(/collects/);
    expect(c.paymentLabel).toMatch(/Cash at pickup/);
  });
  it('ready delivery has no kitchen button (a rider is assigned by admin)', () => {
    const c = toCardProps(pk('ready', 'delivery'), 0, false, h);
    expect(c.actions).toEqual([]);
    expect(c.isPickup).toBe(false);
  });
});
