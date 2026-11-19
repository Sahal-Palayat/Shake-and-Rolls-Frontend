import { useEffect, useMemo, useRef, useState } from 'react';
import type { components } from '@/types/api';
import { Fulfillment } from '@/types/enums';
import { api, errorText, unwrap } from '@/features/api/client';
import { toOrderLines, type CartLine } from './cart';

export type Quote = components['schemas']['OrderQuoteDto'];

const DEBOUNCE_MS = 200;

type State = { quote?: Quote; forKey?: string; error?: string; errorKey?: string; isLoading: boolean };

/**
 * Asks the server what these lines cost. The answer is the only price the UI ever shows.
 * `isCurrent` is false while a newer cart is still being priced, so callers can dim the old numbers.
 */
export function useQuote(lines: CartLine[], fulfillment: Fulfillment, enabled = true) {
  const key = useMemo(() => JSON.stringify([toOrderLines(lines), fulfillment]), [lines, fulfillment]);
  const linesRef = useRef(lines);
  linesRef.current = lines;
  const [state, setState] = useState<State>({ isLoading: false });
  const isEmpty = lines.length === 0;

  useEffect(() => {
    if (!enabled || isEmpty) {
      setState({ isLoading: false });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, isLoading: true }));
    const t = setTimeout(() => {
      unwrap(api.POST('/api/orders/quote', { body: { lines: toOrderLines(linesRef.current), fulfillment } }))
        .then((quote) => !cancelled && setState({ quote, forKey: key, isLoading: false }))
        .catch((e) => !cancelled && setState((s) => ({ quote: s.quote, forKey: s.forKey, error: errorText(e), errorKey: key, isLoading: false })));
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [key, enabled, isEmpty, fulfillment]);

  return {
    quote: isEmpty ? undefined : state.quote,
    isCurrent: !isEmpty && state.forKey === key,
    isLoading: state.isLoading,
    error: !isEmpty && state.errorKey === key ? state.error : undefined,
  };
}
