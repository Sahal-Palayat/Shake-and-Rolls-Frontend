import { describe, expect, it } from 'vitest';
import { formatPhone, normalizeIndianMobile } from './phone';

describe('normalizeIndianMobile', () => {
  it('accepts the usual ways people type a number', () => {
    for (const v of ['9876543210', '98765 43210', '+91 98765-43210', '+919876543210', '09876543210', '919876543210']) {
      expect(normalizeIndianMobile(v)).toBe('9876543210');
    }
  });
  it('rejects landlines, short numbers and junk', () => {
    for (const v of ['', '12345', '5876543210', '98765432101', 'abcdefghij', '+1 9876543210']) expect(normalizeIndianMobile(v)).toBeNull();
  });
});
describe('formatPhone', () => {
  it('groups for reading', () => expect(formatPhone('+919876543210')).toBe('+91 98765 43210'));
  it('leaves odd input alone', () => expect(formatPhone(undefined)).toBe(''));
});
