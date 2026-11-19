import type { components } from '@/types/api';
import { Fulfillment } from '@/types/enums';

type OrderLike = Pick<components['schemas']['OrderDto'], 'fulfillment' | 'deliveryAddress'>;

/** One-line address for staff and customers. Pickup orders have none. */
export function addressText(o: OrderLike, withPincode = false): string {
  const a = o.deliveryAddress;
  if (o.fulfillment === Fulfillment.Pickup || !a) return '';
  return [a.line1, a.area, a.landmark && `Near ${a.landmark}`, withPincode ? a.pincode : undefined].filter(Boolean).join(', ');
}

export const isPickup = (o: Pick<components['schemas']['OrderDto'], 'fulfillment'>) => o.fulfillment === Fulfillment.Pickup;
