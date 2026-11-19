import { describe, expect, it } from 'vitest';
import { cancelPath, canReject, needsRider, statusTone } from './mapper';

describe('orders admin hints', () => {
  it('cancel path', () => {
    expect(cancelPath('placed')).toBe('normal');
    expect(cancelPath('accepted')).toBe('normal');
    for (const s of ['preparing', 'ready', 'assigned', 'picked_up']) expect(cancelPath(s)).toBe('override');
    for (const s of ['delivered', 'rejected', 'cancelled']) expect(cancelPath(s)).toBeNull();
  });
  it('reject only while placed; rider needed from assigned on', () => {
    expect(canReject('placed')).toBe(true);
    expect(canReject('accepted')).toBe(false);
    expect(needsRider('assigned')).toBe(true);
    expect(needsRider('ready')).toBe(false);
  });
  it('tones', () => {
    expect(statusTone('placed')).toBe('new');
    expect(statusTone('delivered')).toBe('closed');
  });
});
