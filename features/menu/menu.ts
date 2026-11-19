import type { components } from '@/types/api';

export type MenuCategory = components['schemas']['MenuCategoryDto'];
export type MenuItem = components['schemas']['MenuItemDto'];
export type OptionGroup = components['schemas']['OptionGroupDto'];

const norm = (s: string) => s.toLocaleLowerCase('en-IN').normalize('NFKD').replace(/\p{Diacritic}/gu, '');

/** Search matches name or description. Categories with nothing left are dropped. Order is kept. */
export function filterMenu(categories: MenuCategory[], search: string, vegOnly: boolean): MenuCategory[] {
  const q = norm(search.trim());
  return categories
    .map((c) => ({
      ...c,
      items: c.items.filter((i) => (!vegOnly || i.isVeg) && (!q || norm(i.name).includes(q) || norm(i.description ?? '').includes(q))),
    }))
    .filter((c) => c.items.length > 0);
}

export function indexItems(categories: MenuCategory[]): Map<string, MenuItem> {
  return new Map(categories.flatMap((c) => c.items.map((i) => [i.id, i] as const)));
}

export function findOption(item: MenuItem, optionId: string) {
  for (const g of item.optionGroups) {
    const o = g.options.find((x) => x.id === optionId);
    if (o) return { group: g, option: o };
  }
  return undefined;
}

/** What the customer may pick, per group, and what is still missing. Server re-checks all of it. */
export type Selection = Record<string, string[]>; // groupId -> optionIds

export function groupProblem(g: OptionGroup, picked: string[]): string | undefined {
  if (picked.length < g.minSelect) return g.minSelect === 1 ? `Choose one ${g.name.toLowerCase()}` : `Choose at least ${g.minSelect} for ${g.name.toLowerCase()}`;
  if (picked.length > g.maxSelect) return `Choose at most ${g.maxSelect}`;
  return undefined;
}

/** Radio-style groups that must have an answer start with the first available option picked. */
export function defaultSelection(item: MenuItem): Selection {
  const sel: Selection = {};
  for (const g of item.optionGroups) {
    const first = g.options.find((o) => o.isAvailable);
    sel[g.id] = g.minSelect >= 1 && g.maxSelect === 1 && first ? [first.id] : [];
  }
  return sel;
}

/** Toggle one option. maxSelect 1 behaves like radio buttons; otherwise checkboxes up to the max. */
export function toggleOption(g: OptionGroup, picked: string[], optionId: string): string[] {
  if (picked.includes(optionId)) return g.maxSelect === 1 && g.minSelect >= 1 ? picked : picked.filter((x) => x !== optionId);
  if (g.maxSelect === 1) return [optionId];
  return picked.length >= g.maxSelect ? picked : [...picked, optionId];
}
