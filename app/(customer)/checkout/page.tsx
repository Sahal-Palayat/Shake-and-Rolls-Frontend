'use client';

import { useCheckout } from '@/features/checkout/useCheckout';
import { CheckoutView } from '@/ui/checkout/CheckoutView';

export default function CheckoutPage() {
  return <CheckoutView {...useCheckout()} />;
}
