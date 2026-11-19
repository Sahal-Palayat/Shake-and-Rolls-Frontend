import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { RiderLoginProps } from '@/ui/rider/RiderLogin';
import { Role } from '@/types/enums';
import { api, errorText, unwrap } from '@/features/api/client';
import { loadSession, saveSession } from '@/features/auth/session';
import { safeRiderNext } from './rider';

const nextPath = () => safeRiderNext(new URLSearchParams(window.location.search).get('next'));

/** Rider sign-in: same staff login endpoint, same JWT; this screen only lets riders through. */
export function useRiderLogin(): RiderLoginProps {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState<{ field: 'username' | 'secret' | 'form'; text: string } | undefined>();
  const [busy, setBusy] = useState(false);

  // Already signed in as a rider: skip the form.
  useEffect(() => {
    const s = loadSession();
    if (s && s.user.role === Role.Rider) router.replace(nextPath());
  }, [router]);

  const submit = async () => {
    if (busy) return;
    const u = username.trim();
    if (!u) return setError({ field: 'username', text: 'Enter your username.' });
    if (!secret) return setError({ field: 'secret', text: 'Enter your password or PIN.' });
    setBusy(true);
    setError(undefined);
    try {
      const res = await unwrap(api.POST('/api/auth/staff/login', { body: { username: u, secret } }));
      if (res.user.role !== Role.Rider) {
        // Never keep a kitchen/admin session from this screen.
        setError({ field: 'form', text: 'This sign-in is for riders. Kitchen and admin use the staff login.' });
        return;
      }
      saveSession(res.accessToken, res.user);
      router.replace(nextPath());
    } catch (e) {
      setError({ field: 'form', text: errorText(e) });
    } finally {
      setBusy(false);
    }
  };

  return {
    title: 'Rider sign in',
    description: 'Use the username and PIN the shop gave you.',
    usernameField: {
      id: 'rider-username',
      label: 'Username',
      autoComplete: 'username',
      value: username,
      onChange: (v) => {
        setUsername(v);
        setError(undefined);
      },
      errorMessage: error?.field === 'username' ? error.text : undefined,
      isDisabled: busy,
    },
    secretField: {
      id: 'rider-secret',
      label: 'Password or PIN',
      type: 'password',
      autoComplete: 'current-password',
      value: secret,
      onChange: (v) => {
        setSecret(v);
        setError(undefined);
      },
      errorMessage: error?.field === 'secret' ? error.text : undefined,
      isDisabled: busy,
    },
    submitLabel: busy ? 'Signing in…' : 'Sign in',
    isBusy: busy,
    onSubmit: () => void submit(),
    errorMessage: error?.field === 'form' ? error.text : undefined,
  };
}
