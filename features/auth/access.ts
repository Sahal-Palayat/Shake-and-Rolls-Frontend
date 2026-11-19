import { Role } from '@/types/enums';

/** Single source for "who may open which /staff page". Used by middleware.ts AND the client shell. No browser APIs here (runs on the edge). */
export type StaffNavDef = { href: string; label: string; roles: readonly Role[] };

/** Name of the role:expiry hint cookie that middleware reads. */
export const COOKIE_NAME = 'sr_hint';

export const STAFF_LOGIN_PATH = '/staff/login';
export const STAFF_HOME = '/staff/kitchen';
export const RIDER_LOGIN_PATH = '/rider/login';

export const STAFF_NAV: readonly StaffNavDef[] = [
  { href: '/staff/kitchen', label: 'Kitchen queue', roles: [Role.Kitchen, Role.Admin] },
  { href: '/staff/orders', label: 'Orders', roles: [Role.Admin] },
  { href: '/staff/menu', label: 'Menu', roles: [Role.Admin] },
  { href: '/staff/accounts', label: 'Staff & riders', roles: [Role.Admin] },
];

export function navFor(role: string): StaffNavDef[] {
  return STAFF_NAV.filter((n) => (n.roles as readonly string[]).includes(role));
}

/** /staff itself and any listed page: allowed only if the role is in that page's list. Unknown /staff/* pages: admin only. */
export function staffPathAllowed(role: string, pathname: string): boolean {
  if (role !== Role.Kitchen && role !== Role.Admin) return false;
  const hit = STAFF_NAV.find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`));
  if (!hit) return pathname === '/staff' || role === Role.Admin;
  return (hit.roles as readonly string[]).includes(role);
}

/** Parses the "role:expiryEpochSeconds" hint cookie. Returns null if absent, malformed or expired. */
export function parseHint(value: string | undefined, nowMs: number): { role: string } | null {
  if (!value) return null;
  const [role, exp] = value.split(':');
  const expSec = Number(exp);
  if (!role || !Number.isFinite(expSec) || expSec * 1000 <= nowMs) return null;
  return { role };
}
