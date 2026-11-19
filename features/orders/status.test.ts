import { describe, expect, it } from 'vitest';
import { closeReason, headlineFor, isTerminal, stepsFor, statusLabel } from './status';

const o = (status: string, fulfillment = 'delivery', log: { to: string; at: string; reason?: string }[] = []) => ({ status, fulfillment, statusLog: log }) as never;

describe('stepsFor', () => {
  it('delivery has 7 steps, pickup 5 (no rider legs)', () => {
    expect(stepsFor(o('placed'))).toHaveLength(7);
    expect(stepsFor(o('placed', 'pickup')).map((s) => s.status)).toEqual(['placed', 'accepted', 'preparing', 'ready', 'delivered']);
  });
  it('marks done / current / todo', () => {
    expect(stepsFor(o('preparing')).map((s) => s.state)).toEqual(['done', 'done', 'current', 'todo', 'todo', 'todo', 'todo']);
  });
  it('a finished order is all done', () => expect(stepsFor(o('delivered', 'pickup')).every((s) => s.state === 'done')).toBe(true));
  it('shows the time a step was reached', () => expect(stepsFor(o('accepted', 'delivery', [{ to: 'placed', at: 'T1' }, { to: 'accepted', at: 'T2' }])).map((s) => s.at).slice(0, 3)).toEqual(['T1', 'T2', undefined]));
  it('a rejected order shows how far it got, then the rejection', () => {
    const s = stepsFor(o('rejected', 'delivery', [{ to: 'placed', at: 'T1' }, { to: 'rejected', at: 'T2', reason: 'Out of paneer' }]));
    expect(s.map((x) => [x.status, x.state])).toEqual([['placed', 'done'], ['rejected', 'current']]);
  });
});

describe('copy', () => {
  it('ready means different things for delivery and pickup', () => {
    expect(statusLabel(o('ready'))).toMatch(/rider/);
    expect(statusLabel(o('ready', 'pickup'))).toBe('Ready for pickup');
    expect(statusLabel(o('delivered', 'pickup'))).toBe('Picked up');
  });
  it('shows the rejection reason but never an admin override note', () => {
    expect(closeReason(o('rejected', 'delivery', [{ to: 'rejected', at: 't', reason: 'Out of paneer' }]))).toBe('Out of paneer');
    expect(closeReason(o('cancelled', 'delivery', [{ to: 'cancelled', at: 't', reason: '[override] stuck' }]))).toBeUndefined();
    expect(headlineFor(o('rejected', 'delivery', [{ to: 'rejected', at: 't', reason: 'Out of paneer' }])).detail).toBe('Reason: Out of paneer');
  });
  it('terminal statuses', () => {
    for (const s of ['delivered', 'rejected', 'cancelled']) expect(isTerminal(s)).toBe(true);
    expect(isTerminal('ready')).toBe(false);
  });
});
