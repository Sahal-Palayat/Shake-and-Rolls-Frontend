import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from '@/types/api';
import { clearSession, loadSession } from '@/features/auth/session';

export const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

const auth: Middleware = {
  onRequest({ request }) {
    const s = loadSession();
    if (s) request.headers.set('Authorization', `Bearer ${s.token}`);
    return request;
  },
  onResponse({ response, request }) {
    // Expired / revoked token on any call except the logins themselves: drop the session.
    const isLogin = request.url.includes('/auth/staff/login') || request.url.includes('/auth/customer/otp/');
    if (response.status === 401 && !isLogin && typeof window !== 'undefined') {
      clearSession();
      const here = location.pathname;
      const inRiderArea = here === '/rider' || here.startsWith('/rider/');
      const inStaffArea = here.startsWith('/staff');
      // Riders: back to the rider sign-in. Staff: back to the staff login.
      // Customers stay put; the screen notices the cleared session and asks for the number again.
      if (inRiderArea && !here.startsWith('/rider/login')) location.assign(`/rider/login?next=${encodeURIComponent(here)}`);
      else if (inStaffArea && !here.startsWith('/staff/login')) location.assign(`/staff/login?next=${encodeURIComponent(here)}`);
    }
    return response;
  },
};

export const api = createClient<paths>({ baseUrl: API_ORIGIN });
api.use(auth);

function messageOf(error: unknown, status: number): string {
  const m = (error as { message?: string | string[] } | undefined)?.message;
  if (Array.isArray(m)) return m.join('. ');
  if (typeof m === 'string' && m) return m;
  if (status === 0) return 'Cannot reach the server. Check your connection.';
  return `Request failed (${status})`;
}

/** Turns an openapi-fetch result into data or a thrown ApiError with a human message. */
export async function unwrap<T>(p: Promise<{ data?: T; error?: unknown; response: Response }>): Promise<T> {
  let r;
  try {
    r = await p;
  } catch {
    throw new ApiError(messageOf(undefined, 0), 0);
  }
  if (r.error !== undefined || !r.response.ok) throw new ApiError(messageOf(r.error, r.response.status), r.response.status);
  return r.data as T;
}

export function errorText(e: unknown): string {
  return e instanceof Error ? e.message : 'Something went wrong';
}
