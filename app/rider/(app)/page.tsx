'use client';

import { useRiderOrders } from '@/features/rider/useRiderOrders';
import { RiderOrders } from '@/ui/rider/RiderOrders';

export default function RiderOrdersPage() {
  return <RiderOrders {...useRiderOrders()} />;
}
