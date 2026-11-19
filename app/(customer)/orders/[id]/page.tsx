'use client';

import { useParams } from 'next/navigation';
import { useOrderTracking } from '@/features/orders/useOrderTracking';
import { OrderTracker } from '@/ui/orders/OrderTracker';

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  return <OrderTracker {...useOrderTracking(id)} />;
}
