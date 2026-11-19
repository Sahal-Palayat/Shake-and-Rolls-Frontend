import { describe, expect, it } from 'vitest';
import { clearIdempotencyKey, idempotencyKeyFor } from './idempotency';

const mem = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) };
};

describe('idempotencyKeyFor', () => {
  it('same request -> same key (double tap / retry)', () => {
    const s = mem();
    expect(idempotencyKeyFor('A', s)).toBe(idempotencyKeyFor('A', s));
  });
  it('changed request -> new key', () => {
    const s = mem();
    expect(idempotencyKeyFor('A', s)).not.toBe(idempotencyKeyFor('B', s));
  });
  it('after clearing, a new key', () => {
    const s = mem();
    const k = idempotencyKeyFor('A', s);
    clearIdempotencyKey(s);
    expect(idempotencyKeyFor('A', s)).not.toBe(k);
  });
  it('keys match the API rule (8-128 of A-Za-z0-9_-)', () => expect(idempotencyKeyFor('A', mem())).toMatch(/^[A-Za-z0-9_-]{8,128}$/));
  it('works with no storage at all', () => expect(idempotencyKeyFor('A', undefined)).toMatch(/^[A-Za-z0-9_-]{8,128}$/));
});
