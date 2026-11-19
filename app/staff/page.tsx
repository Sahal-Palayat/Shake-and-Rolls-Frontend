import { redirect } from 'next/navigation';
import { STAFF_HOME } from '@/features/auth/access';

export default function StaffIndex() {
  redirect(STAFF_HOME);
}
