import type { components } from '@/types/api';
import { Role } from '@/types/enums';
import { COOKIE_NAME } from './access';

export type SessionUser = components['schemas']['UserSummaryDto'];
export type Session = { token: string; user: SessionUser; expiresAt: number }; // expiresAt = epoch seconds

/** Fired (same tab) whenever the session is saved or cleared, so every hook that shows sign-in state can re-read it. */
export const SESSION_CHANGED_EVENT = 'sr:session-changed';
const announce = () => window.dispatchEvent(new Event(SESSION_CHANGED_EVENT));

const KEY = 'sr.session';
/** Cookie (see access.ts) holds role + expiry ONLY, no token. Redirect hint, not security: the API enforces everything. */
const COOKIE = COOKIE_NAME;

function decodeExp(token: string): number {
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(part)) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp : 0;
  } catch {
    return 0;
  }
}

export function saveSession(token: string, user: SessionUser): Session {
  const session: Session = { token, user, expiresAt: decodeExp(token) };
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* private mode: session lives only until reload */
  }
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  const maxAge = Math.max(0, session.expiresAt - Math.floor(Date.now() / 1000));
  document.cookie = `${COOKIE}=${user.role}:${session.expiresAt}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
  announce();
  return session;
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (!s.token || !s.user || s.expiresAt * 1000 <= Date.now()) return null;
    return s;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  document.cookie = `${COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  announce();
}

export function isStaffRole(role: string): boolean {
  return role === Role.Kitchen || role === Role.Admin;
}
