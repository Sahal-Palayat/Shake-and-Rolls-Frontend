'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { components } from '@/types/api';
import type { MenuAdminViewProps } from '@/ui/menu-admin/MenuAdminView';
import type { ItemFormValues } from '@/ui/menu-admin/ItemFormDialog';
import type { CategoryFormValues } from '@/ui/menu-admin/CategoryFormDialog';
import type { NoticeProps } from '@/ui/common/Notice';
import { api, errorText, unwrap } from '@/features/api/client';
import { formatPaise, paiseToRupeesInput, rupeesToPaise } from '@/features/common/format';

type Category = components['schemas']['CategoryDto'];
type Item = components['schemas']['MenuItemDto'];

const EMPTY_ITEM: ItemFormValues = { name: '', description: '', price: '', categoryId: '', isVeg: true, isAvailable: true, sortOrder: '0', imageUrl: '' };
const EMPTY_CAT: CategoryFormValues = { name: '', description: '', sortOrder: '0' };

type ItemDialog = { id?: string; values: ItemFormValues; errors: Partial<Record<keyof ItemFormValues, string>>; formError?: string; saving: boolean; uploading: boolean };
type CatDialog = { id?: string; values: CategoryFormValues; errors: Partial<Record<keyof CategoryFormValues, string>>; formError?: string; saving: boolean };
type Confirm = { kind: 'item' | 'category'; id: string; name: string; busy: boolean };

const isNonNegInt = (v: string) => /^\d{1,6}$/.test(v.trim());

export function validateItem(v: ItemFormValues): { errors: ItemDialog['errors']; paise: number | null } {
  const errors: ItemDialog['errors'] = {};
  if (!v.name.trim()) errors.name = 'Name is required';
  const paise = rupeesToPaise(v.price);
  if (paise === null) errors.price = 'Enter a price like 149 or 149.50';
  else if (paise > 1_000_000) errors.price = 'Price cannot exceed ₹10,000';
  if (!v.categoryId) errors.categoryId = 'Choose a category';
  if (!isNonNegInt(v.sortOrder)) errors.sortOrder = 'Whole number, 0 or more';
  return { errors, paise };
}

export function useMenuAdmin(): MenuAdminViewProps {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [notice, setNotice] = useState<NoticeProps | undefined>();
  const [filter, setFilter] = useState('all');
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [itemDlg, setItemDlg] = useState<ItemDialog | null>(null);
  const [catDlg, setCatDlg] = useState<CatDialog | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);

  const fail = useCallback((e: unknown) => setNotice({ kind: 'error', text: errorText(e), onDismiss: () => setNotice(undefined) }), []);
  const ok = useCallback((text: string) => setNotice({ kind: 'success', text, onDismiss: () => setNotice(undefined) }), []);

  const load = useCallback(async () => {
    try {
      const [c, i] = await Promise.all([unwrap(api.GET('/api/menu/categories')), unwrap(api.GET('/api/menu/items', { params: { query: {} } }))]);
      setCategories(c);
      setItems(i);
    } catch (e) {
      fail(e);
    } finally {
      setLoading(false);
    }
  }, [fail]);

  useEffect(() => {
    void load();
  }, [load]);

  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  // ---------- items ----------
  const toggleAvailable = async (id: string, isAvailable: boolean) => {
    setBusyIds((b) => new Set(b).add(id));
    try {
      const updated = await unwrap(api.PATCH('/api/menu/items/{id}/availability', { params: { path: { id } }, body: { isAvailable } }));
      setItems((xs) => xs.map((x) => (x.id === id ? updated : x)));
    } catch (e) {
      fail(e);
    } finally {
      setBusyIds((b) => { const n = new Set(b); n.delete(id); return n; });
    }
  };

  const openItem = (item?: Item) =>
    setItemDlg({
      id: item?.id,
      values: item
        ? { name: item.name, description: item.description ?? '', price: paiseToRupeesInput(item.pricePaise), categoryId: item.categoryId, isVeg: item.isVeg, isAvailable: item.isAvailable, sortOrder: String(item.sortOrder), imageUrl: item.imageUrl ?? '' }
        : { ...EMPTY_ITEM, categoryId: filter !== 'all' ? filter : (categories[0]?.id ?? '') },
      errors: {},
      saving: false,
      uploading: false,
    });

  const saveItem = async () => {
    if (!itemDlg) return;
    const { errors, paise } = validateItem(itemDlg.values);
    if (Object.keys(errors).length) return setItemDlg({ ...itemDlg, errors, formError: undefined });
    const v = itemDlg.values;
    const body = {
      categoryId: v.categoryId,
      name: v.name.trim(),
      description: v.description.trim(),
      pricePaise: paise as number,
      isVeg: v.isVeg,
      isAvailable: v.isAvailable,
      sortOrder: Number(v.sortOrder),
      ...(v.imageUrl ? { imageUrl: v.imageUrl } : {}),
    };
    setItemDlg({ ...itemDlg, saving: true, formError: undefined });
    try {
      if (itemDlg.id) {
        // optionGroups deliberately omitted: PATCH leaves existing add-ons untouched.
        const updated = await unwrap(api.PATCH('/api/menu/items/{id}', { params: { path: { id: itemDlg.id } }, body }));
        setItems((xs) => xs.map((x) => (x.id === updated.id ? updated : x)));
        ok(`Saved “${updated.name}”.`);
      } else {
        const created = await unwrap(api.POST('/api/menu/items', { body }));
        setItems((xs) => [...xs, created]);
        ok(`Added “${created.name}”.`);
      }
      setItemDlg(null);
    } catch (e) {
      setItemDlg((d) => (d ? { ...d, saving: false, formError: errorText(e) } : d));
    }
  };

  const pickImage = async (file: File | undefined) => {
    if (!file || !itemDlg) return;
    setItemDlg((d) => (d ? { ...d, uploading: true, errors: { ...d.errors, imageUrl: undefined } } : d));
    try {
      const res = await unwrap(
        api.POST('/api/admin/uploads/menu-image', {
          body: { file: '' },
          bodySerializer: () => {
            const fd = new FormData();
            fd.append('file', file);
            return fd;
          },
        }),
      );
      setItemDlg((d) => (d ? { ...d, uploading: false, values: { ...d.values, imageUrl: res.url } } : d));
    } catch (e) {
      setItemDlg((d) => (d ? { ...d, uploading: false, errors: { ...d.errors, imageUrl: errorText(e) } } : d));
    }
  };

  // ---------- categories ----------
  const openCat = (c?: Category) =>
    setCatDlg({ id: c?.id, values: c ? { name: c.name, description: c.description ?? '', sortOrder: String(c.sortOrder) } : EMPTY_CAT, errors: {}, saving: false });

  const saveCat = async () => {
    if (!catDlg) return;
    const v = catDlg.values;
    const errors: CatDialog['errors'] = {};
    if (!v.name.trim()) errors.name = 'Name is required';
    if (!isNonNegInt(v.sortOrder)) errors.sortOrder = 'Whole number, 0 or more';
    if (Object.keys(errors).length) return setCatDlg({ ...catDlg, errors, formError: undefined });
    const body = { name: v.name.trim(), description: v.description.trim(), sortOrder: Number(v.sortOrder) };
    setCatDlg({ ...catDlg, saving: true, formError: undefined });
    try {
      if (catDlg.id) {
        const updated = await unwrap(api.PATCH('/api/menu/categories/{id}', { params: { path: { id: catDlg.id } }, body }));
        setCategories((xs) => xs.map((x) => (x.id === updated.id ? updated : x)).sort((a, b) => a.sortOrder - b.sortOrder));
      } else {
        const created = await unwrap(api.POST('/api/menu/categories', { body }));
        setCategories((xs) => [...xs, created].sort((a, b) => a.sortOrder - b.sortOrder));
      }
      ok('Category saved.');
      setCatDlg(null);
    } catch (e) {
      setCatDlg((d) => (d ? { ...d, saving: false, formError: errorText(e) } : d));
    }
  };

  // ---------- delete ----------
  const doDelete = async () => {
    if (!confirm) return;
    setConfirm({ ...confirm, busy: true });
    try {
      if (confirm.kind === 'item') {
        await unwrap(api.DELETE('/api/menu/items/{id}', { params: { path: { id: confirm.id } } }));
        setItems((xs) => xs.filter((x) => x.id !== confirm.id));
      } else {
        await unwrap(api.DELETE('/api/menu/categories/{id}', { params: { path: { id: confirm.id } } }));
        setCategories((xs) => xs.filter((x) => x.id !== confirm.id));
        if (filter === confirm.id) setFilter('all');
      }
      ok(`Deleted “${confirm.name}”.`);
    } catch (e) {
      fail(e); // e.g. 409 "Category still has items"
    } finally {
      setConfirm(null);
    }
  };

  const visible = items.filter((i) => filter === 'all' || i.categoryId === filter);
  const countIn = (id: string) => items.filter((i) => i.categoryId === id).length;

  return {
    title: 'Menu',
    isLoading,
    notice,
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      subtitle: `${countIn(c.id)} item${countIn(c.id) === 1 ? '' : 's'} · order ${c.sortOrder}`,
      onEdit: () => openCat(c),
      onDelete: () => setConfirm({ kind: 'category', id: c.id, name: c.name, busy: false }),
    })),
    items: visible.map((i) => ({
      id: i.id,
      name: i.name,
      categoryName: catName.get(i.categoryId) ?? 'Unknown',
      priceLabel: formatPaise(i.pricePaise),
      isVeg: i.isVeg,
      vegLabel: i.isVeg ? 'Veg' : 'Non-veg',
      imageUrl: i.imageUrl,
      isAvailable: i.isAvailable,
      isBusy: busyIds.has(i.id),
      onToggleAvailable: (next) => void toggleAvailable(i.id, next),
      onEdit: () => openItem(i),
      onDelete: () => setConfirm({ kind: 'item', id: i.id, name: i.name, busy: false }),
    })),
    emptyItemsText: categories.length === 0 ? 'Create a category first, then add items.' : 'No items here yet.',
    categoryFilter: { value: filter, onChange: setFilter, options: [{ value: 'all', label: 'All categories' }, ...categories.map((c) => ({ value: c.id, label: c.name }))] },
    onAddCategory: () => openCat(),
    onAddItem: () => (categories.length ? openItem() : setNotice({ kind: 'info', text: 'Create a category first.', onDismiss: () => setNotice(undefined) })),
    itemForm: itemDlg
      ? {
          title: itemDlg.id ? 'Edit item' : 'New item',
          values: itemDlg.values,
          errors: itemDlg.errors,
          categoryOptions: categories.map((c) => ({ value: c.id, label: c.name })),
          formErrorMessage: itemDlg.formError,
          isSaving: itemDlg.saving,
          isUploading: itemDlg.uploading,
          saveLabel: itemDlg.id ? 'Save changes' : 'Add item',
          onChange: (field, value) => setItemDlg((d) => (d ? { ...d, values: { ...d.values, [field]: value }, errors: { ...d.errors, [field]: undefined } } : d)),
          onPickImage: (f) => void pickImage(f),
          onRemoveImage: () => setItemDlg((d) => (d ? { ...d, values: { ...d.values, imageUrl: '' } } : d)),
          onSave: () => void saveItem(),
          onCancel: () => setItemDlg(null),
        }
      : undefined,
    categoryForm: catDlg
      ? {
          title: catDlg.id ? 'Edit category' : 'New category',
          values: catDlg.values,
          errors: catDlg.errors,
          formErrorMessage: catDlg.formError,
          isSaving: catDlg.saving,
          saveLabel: catDlg.id ? 'Save changes' : 'Add category',
          onChange: (field, value) => setCatDlg((d) => (d ? { ...d, values: { ...d.values, [field]: value }, errors: { ...d.errors, [field]: undefined } } : d)),
          onSave: () => void saveCat(),
          onCancel: () => setCatDlg(null),
        }
      : undefined,
    confirm: confirm
      ? {
          title: `Delete ${confirm.kind}?`,
          message: confirm.kind === 'category' ? `Delete category “${confirm.name}”? It must have no items.` : `Delete “${confirm.name}”? Past orders keep their own copy of it.`,
          confirmLabel: 'Delete',
          cancelLabel: 'Keep',
          isBusy: confirm.busy,
          onConfirm: () => void doDelete(),
          onCancel: () => setConfirm(null),
        }
      : undefined,
  };
}
