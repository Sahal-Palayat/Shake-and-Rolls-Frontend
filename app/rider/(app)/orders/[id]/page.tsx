'use client';

import { useParams } from 'next/navigation';
import { useRiderOrder } from '@/features/rider/useRiderOrder';
import { RiderOrder } from '@/ui/rider/RiderOrder';

export default function RiderOrderPage() {
  const { id } = useParams<{ id: string }>();
  return <RiderOrder {...useRiderOrder(id)} />;
}
