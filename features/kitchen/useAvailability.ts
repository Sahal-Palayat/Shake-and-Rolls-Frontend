'use client';

import { useCallback, useState } from 'react';
import type { components } from '@/types/api';
import type { AvailabilityPanelProps } from '@/ui/kitchen/AvailabilityPanel';
import { api, errorText, unwrap } from '@/features/api/client';

type Item = components['schemas']['MenuItemDto'];
type Category = components['schemas']['CategoryDto'];

/** Quick sold-out switches for the kitchen. Returns the panel props, or undefined while closed. */
export function useAvailability(onError: (text: string) => void) {
  const [isOpen, setOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState<Set<string>>(new Set());

  const open = useCallback(async () => {
    setOpen(true);
    setLoading(true);
    try {
      const [c, i] = await Promise.all([unwrap(api.GET('/api/menu/categories')), unwrap(api.GET('/api/menu/items', { params: { query: {} } }))]);
      setCats(c);
      setItems(i);
    } catch (e) {
      onError(errorText(e));
    } finally {
      setLoading(false);
    }
  }, [onError]);

  const toggle = async (id: string, isAvailable: boolean) => {
    setBusy((b) => new Set(b).add(id));
    try {
      const updated = await unwrap(api.PATCH('/api/menu/items/{id}/availability', { params: { path: { id } }, body: { isAvailable } }));
      setItems((xs) => xs.map((x) => (x.id === id ? updated : x)));
    } catch (e) {
      onError(errorText(e));
    } finally {
      setBusy((b) => { const n = new Set(b); n.delete(id); return n; });
    }
  };

  const catName = new Map(cats.map((c) => [c.id, c.name]));
  const q = search.trim().toLowerCase();

  const panel: AvailabilityPanelProps | undefined = isOpen
    ? {
        title: 'Item availability',
        isLoading,
        search,
        onSearch: setSearch,
        rows: items
          .filter((i) => !q || i.name.toLowerCase().includes(q))
          .sort((a, b) => Number(a.isAvailable) - Number(b.isAvailable) || a.name.localeCompare(b.name)) // sold-out first
          .map((i) => ({ id: i.id, name: i.name, categoryName: catName.get(i.categoryId) ?? '', isAvailable: i.isAvailable, isBusy: busy.has(i.id), onToggle: (next) => void toggle(i.id, next) })),
        emptyText: 'No items match.',
        closeLabel: 'Done',
        onClose: () => { setOpen(false); setSearch(''); },
      }
    : undefined;

  return { panel, open };
}
