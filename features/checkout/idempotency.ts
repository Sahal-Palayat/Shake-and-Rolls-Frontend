type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
const KEY = 'sr.idem.v1';

const newKey = (): string => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `k${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`);

/**
 * One key per distinct order request. Tapping "Place order" twice, or retrying after a dropped connection,
 * sends the SAME key, so the server returns the same order instead of creating a second one.
 * Change anything in the request and you get a new key.
 */
export function idempotencyKeyFor(requestJson: string, store: Store | undefined = safeSession()): string {
  try {
    const raw = store?.getItem(KEY);
    if (raw) {
      const v = JSON.parse(raw) as { body?: string; key?: string };
      if (v.body === requestJson && typeof v.key === 'string') return v.key;
    }
  } catch {
    /* fall through to a fresh key */
  }
  const key = newKey();
  try {
    store?.setItem(KEY, JSON.stringify({ body: requestJson, key }));
  } catch {
    /* private mode: still works, just without double-tap protection across reloads */
  }
  return key;
}

export function clearIdempotencyKey(store: Store | undefined = safeSession()): void {
  try {
    store?.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

function safeSession(): Store | undefined {
  try {
    return typeof sessionStorage === 'undefined' ? undefined : sessionStorage;
  } catch {
    return undefined;
  }
}
