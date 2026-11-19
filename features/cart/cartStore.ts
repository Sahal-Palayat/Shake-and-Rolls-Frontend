import { useSyncExternalStore } from 'react';
import { addLine, itemCount, parseCart, removeLine, setQuantity, type CartLine, type CartLineInput } from './cart';

/**
 * The cart lives in localStorage so a refresh keeps it, and in a tiny module-level store so every page
 * (menu, checkout, history "reorder") sees the same cart. It holds picks only: never prices.
 */
const KEY = 'sr.cart.v1';
const EMPTY: CartLine[] = [];

let lines: CartLine[] = EMPTY;
let drawerOpen = false;
let notice: string | undefined; // one-off message for the cart drawer (e.g. reorder skipped items)
let loaded = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

function load() {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  try {
    const stored = parseCart(localStorage.getItem(KEY));
    lines = stored.length ? stored : EMPTY;
  } catch {
    lines = EMPTY; // storage blocked: the cart works for this visit only
  }
  // another tab changed the cart
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    const next = parseCart(e.newValue);
    lines = next.length ? next : EMPTY;
    emit();
  });
}

function commit(next: CartLine[]) {
  lines = next.length ? next : EMPTY;
  try {
    if (lines.length) localStorage.setItem(KEY, JSON.stringify(lines));
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore: in-memory cart still works */
  }
  emit();
}

const subscribe = (l: () => void) => {
  load();
  listeners.add(l);
  return () => void listeners.delete(l);
};
const getLines = () => {
  load();
  return lines;
};

export const cartActions = {
  add: (input: CartLineInput) => commit(addLine(getLines(), input)),
  addMany: (inputs: CartLineInput[]) => commit(inputs.reduce((acc, i) => addLine(acc, i), getLines())),
  setQuantity: (key: string, q: number) => commit(setQuantity(getLines(), key, q)),
  remove: (key: string) => commit(removeLine(getLines(), key)),
  clear: () => commit(EMPTY),
  setNotice: (text: string | undefined) => {
    notice = text;
    emit();
  },
  openDrawer: () => {
    drawerOpen = true;
    emit();
  },
  closeDrawer: () => {
    drawerOpen = false;
    emit();
  },
};

/** Server render and first client render are always an empty cart, so hydration never mismatches. */
export function useCartLines(): CartLine[] {
  return useSyncExternalStore(subscribe, getLines, () => EMPTY);
}

export function useCartDrawerOpen(): boolean {
  return useSyncExternalStore(subscribe, () => drawerOpen, () => false);
}

export function useCartNotice(): string | undefined {
  return useSyncExternalStore(subscribe, () => notice, () => undefined);
}

export const useCartCount = (): number => itemCount(useCartLines());
