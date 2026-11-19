import { describe, expect, it } from 'vitest';
import { reorderLines } from './reorder';
import type { MenuItem } from '@/features/menu/menu';

const item = (id: string, over: Partial<MenuItem> = {}): MenuItem => ({ id, name: `Item ${id}`, isAvailable: true, optionGroups: [{ id: 'g', name: 'Add-ons', minSelect: 0, maxSelect: 3, options: [{ id: 'o1', name: 'Cheese', priceDeltaPaise: 2000, isAvailable: true }, { id: 'o2', name: 'Jalapeño', priceDeltaPaise: 1000, isAvailable: false }] }], ...over }) as MenuItem;
const line = (menuItemId: string, optionIds: string[] = [], quantity = 1, note?: string) => ({ menuItemId, name: `Old ${menuItemId}`, quantity, note, options: optionIds.map((optionId) => ({ optionId })) }) as never;

describe('reorderLines', () => {
  it('rebuilds picks with the current name, keeping quantity, add-ons and note', () => {
    const r = reorderLines({ lines: [line('a', ['o1'], 2, 'less spicy')] }, new Map([['a', item('a')]]));
    expect(r.lines).toEqual([{ menuItemId: 'a', optionIds: ['o1'], quantity: 2, note: 'less spicy', name: 'Item a' }]);
    expect(r.skipped).toEqual([]);
  });
  it('skips a removed or sold-out item', () => {
    const r = reorderLines({ lines: [line('gone'), line('out'), line('a')] }, new Map([['out', item('out', { isAvailable: false })], ['a', item('a')]]));
    expect(r.lines.map((l) => l.menuItemId)).toEqual(['a']);
    expect(r.skipped).toEqual(['Old gone', 'Old out']);
  });
  it('skips the whole line when an add-on is sold out (never silently changes the food)', () => {
    const r = reorderLines({ lines: [line('a', ['o2'])] }, new Map([['a', item('a')]]));
    expect(r.lines).toEqual([]);
    expect(r.skipped).toEqual(['Old a']);
  });
});
