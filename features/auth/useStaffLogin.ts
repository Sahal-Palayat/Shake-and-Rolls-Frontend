'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { LoginFormProps } from '@/ui/staff/LoginForm';
import { api, errorText, unwrap } from '@/features/api/client';
import { STAFF_HOME, staffPathAllowed } from './access';
import { isStaffRole, saveSession } from './session';

/** Only same-site /staff paths the role may open. Anything else (open-redirect attempts included) goes home. */
export function safeNext(next: string | null, role: string): string {
  if (next && next.startsWith('/staff/') && !next.startsWith('//') && !next.includes('\\') && staffPathAllowed(role, next)) return next;
  return STAFF_HOME;
}

export function useStaffLogin(): LoginFormProps {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [secret, setSecret] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const onSubmit = useCallback(async () => {
    if (!username.trim() || !secret) {
      setError('Enter your username and password or PIN.');
      return;
    }
    setSubmitting(true);
    setError(undefined);
    try {
      const res = await unwrap(api.POST('/api/auth/staff/login', { body: { username: username.trim(), secret } }));
      if (!isStaffRole(res.user.role)) {
        setError('This account cannot open the staff console.');
        return;
      }
      saveSession(res.accessToken, res.user);
      const next = new URLSearchParams(window.location.search).get('next');
      router.replace(safeNext(next, res.user.role));
    } catch (e) {
      setError(errorText(e));
    } finally {
      setSubmitting(false);
    }
  }, [username, secret, router]);

  return {
    title: 'Shakes & Rolls staff',
    subtitle: 'Kitchen and admin sign in',
    username,
    secret,
    onUsernameChange: setUsername,
    onSecretChange: setSecret,
    onSubmit,
    isSubmitting,
    submitLabel: 'Sign in',
    errorMessage: error,
    onDismissError: () => setError(undefined),
  };
}
