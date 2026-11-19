/** Mirror of backend/src/realtime/realtime.events.ts (wire contract). Change both together. */
export const ServerEvent = {
  OrderCreated: 'order:created',
  OrderStatusChanged: 'order:status_changed',
  AuthExpired: 'auth:expired',
} as const;
