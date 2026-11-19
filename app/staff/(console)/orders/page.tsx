'use client';

import { useOrdersAdmin } from '@/features/orders-admin/useOrdersAdmin';
import { OrdersAdminView } from '@/ui/orders-admin/OrdersAdminView';

export default function OrdersAdminPage() {
  return <OrdersAdminView {...useOrdersAdmin()} />;
}
