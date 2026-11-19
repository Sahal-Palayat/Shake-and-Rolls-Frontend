'use client';

import { useCartRoute } from '@/features/cart/useCartRoute';
import { FullPageMessage } from '@/ui/common/FullPageMessage';

/** /cart opens the cart drawer on the menu. */
export default function CartPage() {
  useCartRoute();
  return <FullPageMessage message="Opening your cart" isLoading />;
}
