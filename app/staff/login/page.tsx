'use client';

import { useStaffLogin } from '@/features/auth/useStaffLogin';
import { LoginForm } from '@/ui/staff/LoginForm';

export default function StaffLoginPage() {
  return <LoginForm {...useStaffLogin()} />;
}
