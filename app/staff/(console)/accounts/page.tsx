'use client';

import { useStaffAdmin } from '@/features/staff-admin/useStaffAdmin';
import { StaffAdminView } from '@/ui/staff-admin/StaffAdminView';

export default function AccountsPage() {
  return <StaffAdminView {...useStaffAdmin()} />;
}
