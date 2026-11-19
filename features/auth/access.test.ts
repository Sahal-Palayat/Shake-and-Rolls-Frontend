import { describe, expect, it } from 'vitest';
import { navFor, parseHint, staffPathAllowed } from './access';

describe('staff access', () => {
  it('kitchen and admin get different nav', () => {
    expect(navFor('kitchen').map((n) => n.label)).toEqual(['Kitchen queue']);
    expect(navFor('admin').map((n) => n.label)).toEqual(['Kitchen queue', 'Orders', 'Menu', 'Staff & riders']);
  });
  it('kitchen cannot open admin pages; customers and riders cannot open /staff', () => {
    expect(staffPathAllowed('kitchen', '/staff/kitchen')).toBe(true);
    for (const p of ['/staff/menu', '/staff/orders', '/staff/accounts', '/staff/anything-new']) expect(staffPathAllowed('kitchen', p)).toBe(false);
    expect(staffPathAllowed('admin', '/staff/menu')).toBe(true);
    expect(staffPathAllowed('rider', '/staff/kitchen')).toBe(false);
    expect(staffPathAllowed('customer', '/staff')).toBe(false);
  });
  it('hint cookie: expired / malformed = none', () => {
    const now = 1_000_000_000_000;
    expect(parseHint(`admin:${now / 1000 + 60}`, now)).toEqual({ role: 'admin' });
    expect(parseHint(`admin:${now / 1000 - 1}`, now)).toBeNull();
    expect(parseHint('garbage', now)).toBeNull();
    expect(parseHint(undefined, now)).toBeNull();
  });
});
