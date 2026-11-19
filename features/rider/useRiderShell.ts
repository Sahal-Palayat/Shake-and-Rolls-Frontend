import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { RiderShellProps } from '@/ui/rider/RiderShell';
import type { NoticeProps } from '@/ui/common/Notice';
import { Role } from '@/types/enums';
import { api, errorText, unwrap } from '@/features/api/client';
import { clearSession, loadSession, SESSION_CHANGED_EVENT, type Session } from '@/features/auth/session';

/**
 * Guard + header for the rider app. The API enforces roles; this only sends a signed-out or wrong-role
 * visitor to the rider sign-in and runs the Online/Offline switch.
 */
export function useRiderShell(): Omit<RiderShellProps, 'children'> {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<{ isReady: boolean; session: Session | null }>({ isReady: false, session: null });
  const [isOnline, setOnline] = useState<boolean | undefined>();
  const [toggling, setToggling] = useState(false);
  const [notice, setNotice] = useState<NoticeProps | undefined>();

  useEffect(() => {
    const sync = () => {
      const s = loadSession();
      const rider = s && s.user.role === Role.Rider ? s : null;
      setState({ isReady: true, session: rider });
      if (!rider) router.replace(`/rider/login?next=${encodeURIComponent(pathname)}`);
    };
    sync();
    window.addEventListener(SESSION_CHANGED_EVENT, sync);
    return () => window.removeEventListener(SESSION_CHANGED_EVENT, sync);
  }, [router, pathname]);

  const token = state.session?.token;
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    unwrap(api.GET('/api/riders/me/availability'))
      .then((a) => !cancelled && setOnline(a.isOnline))
      .catch((e) => !cancelled && setNotice({ kind: 'error', text: errorText(e), onDismiss: () => setNotice(undefined) }));
    return () => {
      cancelled = true;
    };
  }, [token]);

  const toggle = useCallback(async () => {
    if (toggling || isOnline === undefined) return;
    setToggling(true);
    setNotice(undefined);
    try {
      const a = await unwrap(api.PUT('/api/riders/me/availability', { body: { isOnline: !isOnline } }));
      setOnline(a.isOnline); // what the server saved, not what we hoped for
    } catch (e) {
      setNotice({ kind: 'error', text: errorText(e), onDismiss: () => setNotice(undefined) });
    } finally {
      setToggling(false);
    }
  }, [toggling, isOnline]);

  const user = state.session?.user;
  return {
    isAllowed: state.isReady && !!state.session,
    loadingLabel: 'Loading',
    brand: 'Shakes & Rolls',
    roleLabel: 'Rider',
    riderName: user?.name ?? user?.username ?? 'Rider',
    logoutLabel: 'Sign out',
    onLogout: () => {
      clearSession();
      router.replace('/rider/login');
    },
    availability:
      isOnline === undefined
        ? undefined
        : {
            isOnline,
            isBusy: toggling,
            label: isOnline ? 'Online' : 'Offline',
            hint: isOnline ? 'The shop sees you as available.' : 'The shop sees you as offline.',
            switchLabel: 'Take deliveries',
            onToggle: () => void toggle(),
          },
    notice,
  };
}
