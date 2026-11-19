import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, errorText, unwrap } from '@/features/api/client';
import { indexItems, type MenuCategory } from './menu';

/** Loads the public menu once. Everything else (filtering, cart, sheet) builds on this. */
export function useMenuData() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    unwrap(api.GET('/api/menu'))
      .then((data) => !cancelled && setCategories([...data].sort((a, b) => a.sortOrder - b.sortOrder).map((c) => ({ ...c, items: [...c.items].sort((a, b) => a.sortOrder - b.sortOrder) }))))
      .catch((e) => !cancelled && setError(errorText(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const items = useMemo(() => indexItems(categories), [categories]);
  const retry = useCallback(() => setTick((t) => t + 1), []);
  return { categories, items, isLoading, error, retry };
}
