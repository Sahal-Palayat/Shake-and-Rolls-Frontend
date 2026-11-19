'use client';

import { useCallback, useEffect, useState } from 'react';
import type { components } from '@/types/api';
import { Role } from '@/types/enums';
import type { StaffAdminViewProps, StaffFormValues } from '@/ui/staff-admin/StaffAdminView';
import type { NoticeProps } from '@/ui/common/Notice';
import { api, errorText, unwrap } from '@/features/api/client';
import { loadSession } from '@/features/auth/session';
import { humanize } from '@/features/common/format';

type Staff = components['schemas']['UserSummaryDto'];

const EMPTY: StaffFormValues = { name: '', username: '', role: Role.Kitchen, secretType: 'pin', secret: '' };

export function validateStaffForm(v: StaffFormValues): Partial<Record<keyof StaffFormValues, string>> {
  const e: Partial<Record<keyof StaffFormValues, string>> = {};
  if (!v.name.trim()) e.name = 'Name is required';
  if (!/^[a-zA-Z0-9._-]{3,32}$/.test(v.username.trim())) e.username = '3 to 32 characters: letters, digits, . _ -';
  if (v.secretType === 'pin' && !/^\d{4,6}$/.test(v.secret)) e.secret = 'PIN must be 4 to 6 digits';
  if (v.secretType === 'password' && v.secret.length < 8) e.secret = 'Password must be at least 8 characters';
  return e;
}

export function useStaffAdmin(): StaffAdminViewProps {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [notice, setNotice] = useState<NoticeProps | undefined>();
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<{ values: StaffFormValues; errors: ReturnType<typeof validateStaffForm>; formError?: string; saving: boolean } | null>(null);
  const selfId = typeof window === 'undefined' ? undefined : loadSession()?.user.id;

  const say = useCallback((kind: NoticeProps['kind'], text: string) => setNotice({ kind, text, onDismiss: () => setNotice(undefined) }), []);

  useEffect(() => {
    unwrap(api.GET('/api/admin/staff'))
      .then(setStaff)
      .catch((e) => say('error', errorText(e)))
      .finally(() => setLoading(false));
  }, [say]);

  const toggle = async (id: string, isActive: boolean) => {
    setBusy((b) => new Set(b).add(id));
    try {
      const updated = await unwrap(api.PATCH('/api/admin/staff/{id}/active', { params: { path: { id } }, body: { isActive } }));
      setStaff((xs) => xs.map((x) => (x.id === id ? updated : x)));
    } catch (e) {
      say('error', errorText(e));
    } finally {
      setBusy((b) => { const n = new Set(b); n.delete(id); return n; });
    }
  };

  const save = async () => {
    if (!form) return;
    const errors = validateStaffForm(form.values);
    if (Object.keys(errors).length) return setForm({ ...form, errors, formError: undefined });
    const v = form.values;
    setForm({ ...form, saving: true, formError: undefined });
    try {
      const created = await unwrap(
        api.POST('/api/admin/staff', { body: { name: v.name.trim(), username: v.username.trim(), role: v.role as 'kitchen' | 'rider' | 'admin', secretType: v.secretType as 'pin' | 'password', secret: v.secret } }),
      );
      setStaff((xs) => [...xs, created]);
      say('success', `Created ${created.name ?? created.username}. Share the ${v.secretType} with them privately.`);
      setForm(null);
    } catch (e) {
      setForm((f) => (f ? { ...f, saving: false, formError: errorText(e) } : f));
    }
  };

  return {
    title: 'Staff & riders',
    notice,
    isLoading,
    emptyText: 'No accounts yet.',
    rows: staff.map((u) => ({
      id: u.id,
      name: u.name ?? u.username ?? 'Unnamed',
      username: u.username ?? '',
      roleLabel: humanize(u.role),
      isActive: u.isActive,
      isSelf: u.id === selfId,
      isBusy: busy.has(u.id),
      onToggle: (next) => void toggle(u.id, next),
    })),
    onAdd: () => setForm({ values: EMPTY, errors: {}, saving: false }),
    form: form
      ? {
          values: form.values,
          errors: form.errors,
          formErrorMessage: form.formError,
          roleOptions: [{ value: Role.Kitchen, label: 'Kitchen' }, { value: Role.Rider, label: 'Rider' }, { value: Role.Admin, label: 'Admin' }],
          secretTypeOptions: [{ value: 'pin', label: 'PIN (4 to 6 digits)' }, { value: 'password', label: 'Password (8+ characters)' }],
          secretHint: form.values.secretType === 'pin' ? '4 to 6 digits' : 'At least 8 characters',
          isSaving: form.saving,
          onChange: (field, value) => setForm((f) => (f ? { ...f, values: { ...f.values, [field]: value }, errors: { ...f.errors, [field]: undefined } } : f)),
          onSave: () => void save(),
          onCancel: () => setForm(null),
        }
      : undefined,
  };
}
