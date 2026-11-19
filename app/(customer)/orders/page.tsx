'use client';

import { useOrderHistory } from '@/features/orders/useOrderHistory';
import { OrdersHistory } from '@/ui/orders/OrdersHistory';

export default function OrdersPage() {
  return <OrdersHistory {...useOrderHistory()} />;
}
