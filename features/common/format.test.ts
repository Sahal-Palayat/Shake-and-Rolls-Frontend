import { describe, expect, it } from 'vitest';
import { formatPaise, paiseToRupeesInput, rupeesToPaise } from './format';

describe('money', () => {
  it('formats paise as rupees without trailing .00', () => {
    expect(formatPaise(14900)).toBe('₹149');
    expect(formatPaise(14950)).toBe('₹149.50');
  });
  it('parses rupee input to integer paise', () => {
    expect(rupeesToPaise('149')).toBe(14900);
    expect(rupeesToPaise('149.5')).toBe(14950);
    expect(rupeesToPaise('149.05')).toBe(14905);
    expect(rupeesToPaise(' 0 ')).toBe(0);
  });
  it('rejects junk', () => {
    for (const bad of ['', 'abc', '-1', '1.234', '1,000', '₹5', '1e3', '9999999']) expect(rupeesToPaise(bad)).toBeNull();
  });
  it('round-trips', () => {
    for (const p of [0, 5, 100, 14950, 14905]) expect(rupeesToPaise(paiseToRupeesInput(p))).toBe(p);
  });
});
