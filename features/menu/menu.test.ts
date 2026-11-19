import { describe, expect, it } from 'vitest';
import { defaultSelection, filterMenu, groupProblem, toggleOption, type MenuCategory, type MenuItem, type OptionGroup } from './menu';

const item = (id: string, name: string, over: Partial<MenuItem> = {}): MenuItem =>
  ({ id, categoryId: 'c', name, pricePaise: 100, isVeg: true, isAvailable: true, sortOrder: 0, optionGroups: [], ...over }) as MenuItem;
const cats: MenuCategory[] = [
  { id: 'w', name: 'Wraps', sortOrder: 0, items: [item('1', 'Paneer Tikka Wrap', { description: 'Smoky paneer' }), item('2', 'Chicken Wrap', { isVeg: false })] },
  { id: 's', name: 'Shakes', sortOrder: 1, items: [item('3', 'Mango Shake')] },
];

describe('filterMenu', () => {
  it('no filters keeps everything', () => expect(filterMenu(cats, '', false).flatMap((c) => c.items)).toHaveLength(3));
  it('veg only drops non-veg and empty categories', () => {
    const r = filterMenu(cats, '', true);
    expect(r.flatMap((c) => c.items.map((i) => i.id))).toEqual(['1', '3']);
  });
  it('search is case-insensitive and matches descriptions', () => {
    expect(filterMenu(cats, 'MANGO', false).map((c) => c.id)).toEqual(['s']);
    expect(filterMenu(cats, 'smoky', false)[0].items[0].id).toBe('1');
  });
  it('no match = empty list', () => expect(filterMenu(cats, 'pizza', false)).toEqual([]));
  it('unavailable items stay visible (shown as sold out)', () => {
    const c = [{ ...cats[0], items: [item('9', 'Sold Wrap', { isAvailable: false })] }];
    expect(filterMenu(c, '', false)[0].items).toHaveLength(1);
  });
});

const grp = (over: Partial<OptionGroup>): OptionGroup => ({ id: 'g', name: 'Size', minSelect: 1, maxSelect: 1, options: [{ id: 'a', name: 'Regular', priceDeltaPaise: 0, isAvailable: false }, { id: 'b', name: 'Large', priceDeltaPaise: 3000, isAvailable: true }], ...over });

describe('option selection', () => {
  it('required single-choice groups start on the first AVAILABLE option', () => {
    expect(defaultSelection(item('1', 'x', { optionGroups: [grp({})] }))).toEqual({ g: ['b'] });
  });
  it('optional groups start empty', () => expect(defaultSelection(item('1', 'x', { optionGroups: [grp({ minSelect: 0, maxSelect: 3 })] }))).toEqual({ g: [] }));
  it('radio: picking replaces, and you cannot untick a required choice', () => {
    const g = grp({});
    expect(toggleOption(g, ['a'], 'b')).toEqual(['b']);
    expect(toggleOption(g, ['b'], 'b')).toEqual(['b']);
  });
  it('checkboxes: toggle on/off, stop at max', () => {
    const g = grp({ minSelect: 0, maxSelect: 2, options: ['a', 'b', 'c'].map((id) => ({ id, name: id, priceDeltaPaise: 0, isAvailable: true })) });
    let p: string[] = [];
    p = toggleOption(g, p, 'a');
    p = toggleOption(g, p, 'b');
    expect(toggleOption(g, p, 'c')).toEqual(['a', 'b']);
    expect(toggleOption(g, p, 'a')).toEqual(['b']);
  });
  it('explains what is missing', () => {
    expect(groupProblem(grp({}), [])).toBe('Choose one size');
    expect(groupProblem(grp({ minSelect: 2, maxSelect: 3 }), ['a'])).toBe('Choose at least 2 for size');
    expect(groupProblem(grp({}), ['a'])).toBeUndefined();
  });
});
