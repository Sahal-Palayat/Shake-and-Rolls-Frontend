import { useCallback, useEffect, useState } from 'react';
import type { OtpPanelProps } from '@/ui/auth/OtpPanel';
import { Role } from '@/types/enums';
import { api, errorText, unwrap } from '@/features/api/client';
import { formatPhone, normalizeIndianMobile } from '@/features/common/phone';
import { clearSession, loadSession, saveSession, SESSION_CHANGED_EVENT, type Session } from './session';

/** Who is signed in as a customer, if anyone. A staff session on the same browser does not count. */
export function useCustomerSession() {
  const [state, setState] = useState<{ isReady: boolean; session: Session | null }>({ isReady: false, session: null });
  useEffect(() => {
    const sync = () => {
      const s = loadSession();
      setState({ isReady: true, session: s && s.user.role === Role.Customer ? s : null });
    };
    sync();
    window.addEventListener(SESSION_CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(SESSION_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return state;
}

const RESEND_SECONDS = 30;
const CODE_RE = /^\d{6}$/;

type Copy = { title: string; description: string };

/**
 * Phone OTP sign-in. There is no separate "guest" account: verifying a number is the whole sign-in,
 * and the same number comes back to the same customer next time.
 */
export function useCustomerAuth(copy: Copy) {
  const { isReady, session } = useCustomerSession();
  const [phase, setPhase] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ field: 'phone' | 'code' | 'form'; text: string } | undefined>();
  const [info, setInfo] = useState<string | undefined>();
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const requestCode = useCallback(async () => {
    const n = normalizeIndianMobile(phone);
    if (!n) return setError({ field: 'phone', text: 'Enter a 10-digit mobile number.' });
    setBusy(true);
    setError(undefined);
    setInfo(undefined);
    try {
      const r = await unwrap(api.POST('/api/auth/customer/otp/request', { body: { phone: n } }));
      setPhase('code');
      setCode('');
      setCooldown(RESEND_SECONDS);
      setInfo(`We sent a 6-digit code to ${formatPhone(`+91${n}`)}. It works for ${Math.max(1, Math.round(r.expiresInSeconds / 60))} minutes.`);
    } catch (e) {
      setError({ field: 'form', text: errorText(e) });
    } finally {
      setBusy(false);
    }
  }, [phone]);

  const verifyCode = useCallback(async () => {
    const n = normalizeIndianMobile(phone);
    if (!n) return setError({ field: 'phone', text: 'Enter a 10-digit mobile number.' });
    if (!CODE_RE.test(code.trim())) return setError({ field: 'code', text: 'Enter the 6-digit code.' });
    setBusy(true);
    setError(undefined);
    try {
      const res = await unwrap(api.POST('/api/auth/customer/otp/verify', { body: { phone: n, code: code.trim() } }));
      if (res.user.role !== Role.Customer) return setError({ field: 'form', text: 'This number belongs to a staff account. Use the staff sign-in.' });
      saveSession(res.accessToken, res.user);
      setPhase('phone');
      setCode('');
      setInfo(undefined);
    } catch (e) {
      setError({ field: 'code', text: errorText(e) });
    } finally {
      setBusy(false);
    }
  }, [phone, code]);

  const signOut = useCallback(() => clearSession(), []);

  const otpPanel: OtpPanelProps = {
    title: copy.title,
    description: copy.description,
    phase,
    phoneField: {
      id: 'otp-phone',
      label: 'Mobile number',
      type: 'tel',
      inputMode: 'numeric',
      autoComplete: 'tel-national',
      placeholder: '98765 43210',
      value: phone,
      onChange: (v) => {
        setPhone(v);
        if (phase === 'code') {
          setPhase('phone'); // a different number needs a new code
          setCode('');
          setInfo(undefined);
        }
        setError(undefined);
      },
      errorMessage: error?.field === 'phone' ? error.text : undefined,
      isDisabled: busy,
    },
    codeField: {
      id: 'otp-code',
      label: '6-digit code',
      inputMode: 'numeric',
      autoComplete: 'one-time-code',
      maxLength: 6,
      value: code,
      onChange: (v) => {
        setCode(v.replace(/\D/g, ''));
        setError(undefined);
      },
      errorMessage: error?.field === 'code' ? error.text : undefined,
      isDisabled: busy,
    },
    primaryAction: phase === 'phone' ? { label: 'Send code', onClick: () => void requestCode(), isLoading: busy, isDisabled: false } : { label: 'Verify', onClick: () => void verifyCode(), isLoading: busy, isDisabled: false },
    secondaryAction: phase === 'code' ? { label: cooldown > 0 ? `Send a new code in ${cooldown}s` : 'Send a new code', onClick: () => void requestCode(), isDisabled: busy || cooldown > 0 } : undefined,
    errorMessage: error?.field === 'form' ? error.text : undefined,
    infoMessage: info,
  };

  return { isReady, session, isSignedIn: !!session, phoneLabel: formatPhone(session?.user.phone), signOut, otpPanel };
}
