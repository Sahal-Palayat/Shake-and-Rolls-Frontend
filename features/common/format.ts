/** Formatting lives here, never in ui/. The UI receives finished strings. */

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });

export function formatPaise(paise: number): string {
  return inr.format(paise / 100).replace(/\.00$/, '');
}

/** "149" or "149.50" -> 14950. Returns null for anything that is not a sane rupee amount (max 2 decimals). */
export function rupeesToPaise(input: string): number | null {
  const m = /^\s*(\d{1,6})(?:\.(\d{1,2}))?\s*$/.exec(input);
  if (!m) return null;
  return Number(m[1]) * 100 + Number((m[2] ?? '').padEnd(2, '0') || 0);
}

export function paiseToRupeesInput(paise: number): string {
  const r = Math.floor(paise / 100);
  const p = paise % 100;
  return p === 0 ? String(r) : `${r}.${String(p).padStart(2, '0')}`;
}

export function minutesSince(iso: string, now: number): number {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60_000));
}

export function formatAge(iso: string, now: number): string {
  const m = minutesSince(iso, now);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  return `${h} h ${m % 60} min ago`;
}

const dateTime = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}

export function humanize(snake: string): string {
  const s = snake.replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}
