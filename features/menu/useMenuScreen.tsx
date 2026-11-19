import { useEffect, useMemo, useRef, useState } from 'react';
import type { MenuScreenProps } from '@/ui/menu/MenuScreen';
import type { MenuItemCardProps } from '@/ui/menu/MenuItemCard';
import { ItemSheet } from '@/ui/cart/ItemSheet';
import { CartDrawer } from '@/ui/cart/CartDrawer';
import { formatPaise } from '@/features/common/format';
import { quantityOfItem } from '@/features/cart/cart';
import { useCartLines } from '@/features/cart/cartStore';
import { useCartDrawer } from '@/features/cart/useCartDrawer';
import { useHydrated } from '@/features/common/useHydrated';
import { filterMenu, type MenuItem } from './menu';
import { useItemSheet } from './useItemSheet';
import { useMenuData } from './useMenuData';

const secId = (id: string) => `cat-${id}`;
const tabId = (id: string) => `tab-${id}`;

export function useMenuScreen(): MenuScreenProps {
  const menu = useMenuData();
  const hydrated = useHydrated();
  const lines = useCartLines();
  const [search, setSearch] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [activeId, setActiveId] = useState<string | undefined>();
  const clickLock = useRef(0); // ignore scroll-spy briefly after a tab click so the tab does not flicker

  const sections = useMemo(() => filterMenu(menu.categories, search, vegOnly), [menu.categories, search, vegOnly]);
  const sheet = useItemSheet(menu.items);
  const { cartBar, drawer } = useCartDrawer(menu.items);

  // Scroll-spy: the section under the sticky bar is the active tab.
  const sectionKey = sections.map((s) => s.id).join(',');
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(secId(s.id))).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    setActiveId((cur) => (cur && sections.some((s) => s.id === cur) ? cur : sections[0].id));
    const io = new IntersectionObserver(
      (entries) => {
        if (Date.now() < clickLock.current) return;
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActiveId(hit.target.id.replace(/^cat-/, ''));
      },
      { rootMargin: '-140px 0px -65% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKey]);

  // keep the active tab visible in the scrolling tab bar
  useEffect(() => {
    if (activeId) document.getElementById(tabId(activeId))?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [activeId]);

  const selectTab = (id: string) => {
    setActiveId(id);
    clickLock.current = Date.now() + 800;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(secId(id))?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  const card = (i: MenuItem): MenuItemCardProps => {
    const inCart = quantityOfItem(lines, i.id);
    return {
      id: i.id,
      name: i.name,
      description: i.description ?? '',
      priceLabel: i.optionGroups.length ? `From ${formatPaise(i.pricePaise)}` : formatPaise(i.pricePaise),
      imageUrl: i.imageUrl,
      imageFallback: i.name.charAt(0).toUpperCase(),
      isVeg: i.isVeg,
      vegLabel: i.isVeg ? 'Veg' : 'Non-veg',
      isAvailable: i.isAvailable,
      soldOutLabel: 'Sold out',
      inCartLabel: hydrated && inCart ? `${inCart} in cart` : undefined,
      addLabel: i.optionGroups.length ? 'Customise' : 'Add',
      addAriaLabel: i.optionGroups.length ? `Customise ${i.name}` : `Add ${i.name} to cart`,
      onOpen: () => sheet.open(i),
      onAdd: () => sheet.quickAdd(i),
    };
  };

  const filtersActive = search.trim() !== '' || vegOnly;
  const message = menu.error
    ? { text: menu.error, actionLabel: 'Try again', onAction: menu.retry }
    : !menu.isLoading && sections.length === 0
      ? filtersActive
        ? { text: 'Nothing matches. Try another word or turn off the veg filter.', actionLabel: 'Clear filters', onAction: () => { setSearch(''); setVegOnly(false); } }
        : { text: 'The menu is empty right now. Please check back soon.' }
      : undefined;

  return {
    search: { value: search, label: 'Search the menu', placeholder: 'Search wraps, shakes, fries', onChange: setSearch },
    vegFilter: { label: 'Veg only', isOn: vegOnly, onToggle: setVegOnly, onText: 'Veg only', offText: 'Veg only' },
    tabs: sections.map((s) => ({ id: s.id, domId: tabId(s.id), label: s.name, isActive: s.id === activeId, onSelect: () => selectTab(s.id) })),
    tabsLabel: 'Menu categories',
    sections: sections.map((s) => ({ id: s.id, domId: secId(s.id), title: s.name, description: s.description, items: s.items.map(card) })),
    isLoading: menu.isLoading,
    loadingLabel: 'Loading the menu',
    message,
    cartBar: hydrated ? cartBar : undefined,
    overlays: (
      <>
        {sheet.props ? <ItemSheet {...sheet.props} /> : null}
        {hydrated && drawer ? <CartDrawer {...drawer} /> : null}
      </>
    ),
  };
}
