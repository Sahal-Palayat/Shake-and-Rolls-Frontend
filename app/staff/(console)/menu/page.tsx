'use client';

import { useMenuAdmin } from '@/features/menu-admin/useMenuAdmin';
import { MenuAdminView } from '@/ui/menu-admin/MenuAdminView';

export default function MenuAdminPage() {
  return <MenuAdminView {...useMenuAdmin()} />;
}
