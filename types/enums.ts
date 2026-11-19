// Mirror of backend/src/common/enums.ts. Change both in the same step.

export enum Role {
  Customer = 'customer',
  Kitchen = 'kitchen',
  Rider = 'rider',
  Admin = 'admin',
}

export enum OrderStatus {
  Placed = 'placed',
  Accepted = 'accepted',
  Preparing = 'preparing',
  Ready = 'ready',
  Assigned = 'assigned',
  PickedUp = 'picked_up',
  Delivered = 'delivered',
  Rejected = 'rejected',
  Cancelled = 'cancelled',
}

export enum PaymentStatus {
  CodPending = 'cod_pending',
  PaymentPending = 'payment_pending',
  Paid = 'paid',
  Failed = 'failed',
  Refunded = 'refunded',
  CodCollected = 'cod_collected',
}

export enum Fulfillment {
  Delivery = 'delivery',
  Pickup = 'pickup',
}
