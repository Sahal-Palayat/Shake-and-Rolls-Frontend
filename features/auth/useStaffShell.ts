'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { FullPageMessageProps } from '@/ui/common/FullPageMessage';
import type { StaffShellProps } from '@/ui/staff/StaffShell';
import { api, ApiError, unwrap } from '@/features/api/client';
import { humanize } from '@/features/common/format';
import { navFor, staffPathAllowed, STAFF_HOME, STAFF_LOGIN_PATH } from './access';
import { clearSession, isStaffRole, loadSession, saveSession, type SessionUser } from './session';

type Result =
  | { phase: 'ready'; shellProps: Omit<StaffShellProps, 'children'>; user: SessionUser }
  | { phase: 'blocked'; messageProps: FullPageMessageProps };

/** Client-side guard + shell data. Middleware already redirected anyone without a hint cookie; this verifies with the API. */
export function useStaffShell(): Result {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const toLogin = useCallback(() => {
    clearSession();
    router.replace(STAFF_LOGIN_PATH);
  }, [router]);

  useEffect(() => {
    const session = loadSession();
    if (!session) {
      toLogin();
      return;
    }
    let cancelled = false;
    setFailure(null);
    unwrap(api.GET('/api/auth/me'))
      .then((me) => {
        if (cancelled) return;
        if (!me.isActive || !isStaffRole(me.role)) return toLogin();
        saveSession(session.token, me); // role in the cookie hint follows the DB
        setUser(me);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) return toLogin();
        setFailure('Cannot reach the server.');
      });
    return () => {
      cancelled = true;
    };
  }, [attempt, toLogin]);

  const allowed = user ? staffPathAllowed(user.role, pathname) : false;
  useEffect(() => {
    if (user && !allowed) router.replace(STAFF_HOME);
  }, [user, allowed, router]);

  if (failure) return { phase: 'blocked', messageProps: { message: failure, actionLabel: 'Try again', onAction: () => setAttempt((n) => n + 1) } };
  if (!user || !allowed) return { phase: 'blocked', messageProps: { message: 'Loading…', isLoading: true } };

  return {
    phase: 'ready',
    user,
    shellProps: {
      brandLabel: 'Shakes & Rolls',
      navItems: navFor(user.role).map((n) => ({ href: n.href, label: n.label, isActive: pathname === n.href || pathname.startsWith(`${n.href}/`) })),
      userName: user.name ?? user.username ?? 'Staff',
      roleLabel: humanize(user.role),
      logoutLabel: 'Sign out',
      onNavigate: (href) => router.push(href),
      onLogout: toLogin,
    },
  };
}
