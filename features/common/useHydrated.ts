import { useSyncExternalStore } from 'react';

/** false during server render and the first client render, true after. Stops "empty cart" flashing before localStorage is read. */
export function useHydrated(): boolean {
  return useSyncExternalStore(() => () => {}, () => true, () => false);
}
