'use client';

import { useRiderLogin } from '@/features/rider/useRiderLogin';
import { RiderLogin } from '@/ui/rider/RiderLogin';

export default function RiderLoginPage() {
  return <RiderLogin {...useRiderLogin()} />;
}
