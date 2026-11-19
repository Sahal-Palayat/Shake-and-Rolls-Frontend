/**
 * Pure cart rules. No browser, no React, no prices: prices only ever come from the server (POST /api/orders/quote).
 * A cart line is "what the customer picked", nothing more.
 */
export type CartLine = {
  key: string; // identifies this exact combination in the cart
  menuItemId: string;
  optionIds: string[]; // sorted
  quantity: number;
  note: string;
  name: string; // display snapshot so the cart reads right before the menu has loaded
};

export type CartLineInput = Omit<CartLine, 'key'>;

/** Display cap only. The API enforces its own limits and answers 400 if this is out of step. */
export const MAX_QTY = 10;
export const MAX_LINES = 30;
export const NOTE_MAX = 200;

const sortedIds = (ids: string[]) => [...new Set(ids)].sort();

export function lineKey(menuItemId: string, optionIds: string[], note: string): string {
  return `${menuItemId}|${sortedIds(optionIds).join(',')}|${note.trim().toLowerCase()}`;
}

export function addLine(lines: CartLine[], input: CartLineInput): CartLine[] {
  const optionIds = sortedIds(input.optionIds);
  const note = input.note.trim().slice(0, NOTE_MAX);
  const key = lineKey(input.menuItemId, optionIds, note);
  const qty = Math.max(1, Math.floor(input.quantity));
  const i = lines.findIndex((l) => l.key === key);
  if (i >= 0) return lines.map((l, n) => (n === i ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + qty) } : l));
  if (lines.length >= MAX_LINES) return lines;
  return [...lines, { key, menuItemId: input.menuItemId, optionIds, quantity: Math.min(MAX_QTY, qty), note, name: input.name }];
}

/** 0 or less removes the line. */
export function setQuantity(lines: CartLine[], key: string, quantity: number): CartLine[] {
  if (quantity <= 0) return lines.filter((l) => l.key !== key);
  return lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(MAX_QTY, Math.floor(quantity)) } : l));
}

export const removeLine = (lines: CartLine[], key: string): CartLine[] => lines.filter((l) => l.key !== key);

export const itemCount = (lines: CartLine[]): number => lines.reduce((n, l) => n + l.quantity, 0);

/** Total quantity of one menu item across all its variants (for the "x in cart" hint on the menu). */
export const quantityOfItem = (lines: CartLine[], menuItemId: string): number =>
  lines.reduce((n, l) => (l.menuItemId === menuItemId ? n + l.quantity : n), 0);

/** Reads whatever is in storage and keeps only what is safe to use. Bad data = empty cart, never a crash. */
export function parseCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    let out: CartLine[] = [];
    for (const r of data.slice(0, MAX_LINES)) {
      if (typeof r !== 'object' || r === null) continue;
      const o = r as Record<string, unknown>;
      if (typeof o.menuItemId !== 'string' || !/^[a-f0-9]{24}$/i.test(o.menuItemId)) continue;
      const optionIds = Array.isArray(o.optionIds) ? o.optionIds.filter((x): x is string => typeof x === 'string' && /^[a-f0-9]{24}$/i.test(x)) : [];
      const quantity = Number(o.quantity);
      if (!Number.isFinite(quantity) || quantity < 1) continue;
      out = addLine(out, {
        menuItemId: o.menuItemId,
        optionIds,
        quantity: Math.min(MAX_QTY, Math.floor(quantity)),
        note: typeof o.note === 'string' ? o.note : '',
        name: typeof o.name === 'string' ? o.name.slice(0, 120) : 'Item',
      });
    }
    return out;
  } catch {
    return [];
  }
}

/** The body for POST /api/orders/quote and POST /api/orders. Same lines, so the quote and the order agree. */
export function toOrderLines(lines: CartLine[]): { menuItemId: string; quantity: number; optionIds?: string[]; note?: string }[] {
  return lines.map((l) => ({
    menuItemId: l.menuItemId,
    quantity: l.quantity,
    ...(l.optionIds.length ? { optionIds: l.optionIds } : {}),
    ...(l.note ? { note: l.note } : {}),
  }));
}
