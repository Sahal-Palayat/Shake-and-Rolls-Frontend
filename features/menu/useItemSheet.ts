import { useMemo, useState } from 'react';
import type { ItemSheetProps } from '@/ui/cart/ItemSheet';
import { Fulfillment } from '@/types/enums';
import { cartActions } from '@/features/cart/cartStore';
import { MAX_QTY, NOTE_MAX, type CartLine } from '@/features/cart/cart';
import { useQuote } from '@/features/cart/useQuote';
import { formatPaise } from '@/features/common/format';
import { defaultSelection, groupProblem, toggleOption, type MenuItem, type Selection } from './menu';

type Draft = { itemId: string; selection: Selection; quantity: number; note: string };

/** The "customise and add" sheet. Its price is the shop's own quote for exactly what is picked. */
export function useItemSheet(items: Map<string, MenuItem>) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const item = draft ? items.get(draft.itemId) : undefined;

  const optionIds = useMemo(() => (draft ? Object.values(draft.selection).flat() : []), [draft]);
  const draftLines = useMemo<CartLine[]>(
    () => (draft && item ? [{ key: 'draft', menuItemId: item.id, optionIds, quantity: draft.quantity, note: draft.note.trim(), name: item.name }] : []),
    [draft, item, optionIds],
  );
  const quote = useQuote(draftLines, Fulfillment.Delivery, !!item);

  const open = (menuItem: MenuItem) => setDraft({ itemId: menuItem.id, selection: defaultSelection(menuItem), quantity: 1, note: '' });
  const close = () => setDraft(null);

  /** Items with nothing to choose are added straight away; others open the sheet. */
  const quickAdd = (menuItem: MenuItem) => {
    if (menuItem.optionGroups.length) return open(menuItem);
    cartActions.add({ menuItemId: menuItem.id, optionIds: [], quantity: 1, note: '', name: menuItem.name });
  };

  let props: ItemSheetProps | undefined;
  if (draft && item) {
    const problems = item.optionGroups.map((g) => groupProblem(g, draft.selection[g.id] ?? []));
    const hasProblem = problems.some(Boolean);
    const line = quote.isCurrent ? quote.quote?.lines[0] : undefined;
    const canAdd = !hasProblem && !!line && !quote.error;
    props = {
      title: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      isVeg: item.isVeg,
      vegLabel: item.isVeg ? 'Veg' : 'Non-veg',
      groups: item.optionGroups.map((g, gi) => ({
        id: g.id,
        title: g.name,
        hint: g.maxSelect === 1 ? (g.minSelect >= 1 ? 'Choose one' : 'Choose one (optional)') : g.minSelect >= 1 ? `Choose ${g.minSelect} to ${g.maxSelect}` : `Choose up to ${g.maxSelect} (optional)`,
        control: g.maxSelect === 1 ? 'radio' : 'checkbox',
        options: g.options.map((o) => ({
          id: o.id,
          label: o.name,
          priceLabel: o.priceDeltaPaise > 0 ? `+${formatPaise(o.priceDeltaPaise)}` : undefined,
          isSelected: (draft.selection[g.id] ?? []).includes(o.id),
          isDisabled: !o.isAvailable,
          disabledLabel: 'Sold out',
          onToggle: () => setDraft((d) => (d ? { ...d, selection: { ...d.selection, [g.id]: toggleOption(g, d.selection[g.id] ?? [], o.id) } } : d)),
        })),
        errorMessage: problems[gi],
      })),
      noteField: { id: 'item-note', label: 'Note for the kitchen (optional)', placeholder: 'e.g. less spicy, no onions', maxLength: NOTE_MAX, value: draft.note, onChange: (v) => setDraft((d) => (d ? { ...d, note: v } : d)) },
      quantityLabel: 'Quantity',
      quantity: {
        label: `Quantity of ${item.name}`,
        valueLabel: String(draft.quantity),
        decreaseLabel: 'One less',
        increaseLabel: 'One more',
        isDecreaseDisabled: draft.quantity <= 1,
        isIncreaseDisabled: draft.quantity >= MAX_QTY,
        onDecrease: () => setDraft((d) => (d ? { ...d, quantity: Math.max(1, d.quantity - 1) } : d)),
        onIncrease: () => setDraft((d) => (d ? { ...d, quantity: Math.min(MAX_QTY, d.quantity + 1) } : d)),
      },
      priceLabel: line ? formatPaise(line.lineTotalPaise) : quote.quote ? formatPaise(quote.quote.lines[0]?.lineTotalPaise ?? 0) : '',
      priceCaption: quote.isCurrent ? 'Price confirmed by the shop' : 'Checking price…',
      isPriceUpdating: !quote.isCurrent && !quote.error,
      errorMessage: quote.error,
      addButton: {
        label: line ? `Add to cart · ${formatPaise(line.lineTotalPaise)}` : 'Add to cart',
        isDisabled: !canAdd,
        onClick: () => {
          cartActions.add({ menuItemId: item.id, optionIds, quantity: draft.quantity, note: draft.note, name: item.name });
          close();
        },
      },
      closeLabel: 'Close',
      onClose: close,
    };
  }
  return { props, open, close, quickAdd };
}
