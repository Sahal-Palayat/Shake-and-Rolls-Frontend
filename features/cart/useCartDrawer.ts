import { useRouter } from 'next/navigation';
import type { CartBarProps } from '@/ui/cart/CartBar';
import type { CartDrawerProps } from '@/ui/cart/CartDrawer';
import { Fulfillment } from '@/types/enums';
import { formatPaise } from '@/features/common/format';
import { findOption, type MenuItem } from '@/features/menu/menu';
import { itemCount, MAX_QTY } from './cart';
import { cartActions, useCartDrawerOpen, useCartLines, useCartNotice } from './cartStore';
import { useQuote } from './useQuote';

/** Cart bar + cart drawer. Every price shown comes from the server quote; while it is being fetched the numbers dim. */
export function useCartDrawer(items: Map<string, MenuItem>): { cartBar?: CartBarProps; drawer?: CartDrawerProps } {
  const router = useRouter();
  const lines = useCartLines();
  const isOpen = useCartDrawerOpen();
  const notice = useCartNotice();
  const q = useQuote(lines, Fulfillment.Delivery, lines.length > 0);
  if (lines.length === 0 && !isOpen) return {};

  const count = itemCount(lines);
  const quote = q.isCurrent ? q.quote : undefined;
  const menuLoaded = items.size > 0;

  const drawerLines = lines.map((l, i) => {
    const item = items.get(l.menuItemId);
    const gone = menuLoaded && (!item || !item.isAvailable);
    const optionGone = !!item && l.optionIds.some((id) => { const f = findOption(item, id); return !f || !f.option.isAvailable; });
    const optionNames = item ? l.optionIds.map((id) => findOption(item, id)?.option.name).filter(Boolean).join(', ') : '';
    return {
      id: l.key,
      name: item?.name ?? l.name,
      isVeg: item?.isVeg ?? true,
      vegLabel: item ? (item.isVeg ? 'Veg' : 'Non-veg') : 'Veg',
      optionsText: optionNames || undefined,
      note: l.note || undefined,
      priceLabel: quote?.lines[i] ? formatPaise(quote.lines[i].lineTotalPaise) : '…',
      warning: gone ? 'No longer available. Remove it to continue.' : optionGone ? 'An add-on is no longer available. Remove it to continue.' : undefined,
      quantity: {
        label: `Quantity of ${item?.name ?? l.name}`,
        valueLabel: String(l.quantity),
        decreaseLabel: l.quantity === 1 ? 'Remove one' : 'One less',
        increaseLabel: 'One more',
        isIncreaseDisabled: l.quantity >= MAX_QTY,
        onDecrease: () => cartActions.setQuantity(l.key, l.quantity - 1),
        onIncrease: () => cartActions.setQuantity(l.key, l.quantity + 1),
      },
      removeLabel: 'Remove',
      onRemove: () => cartActions.remove(l.key),
    };
  });

  const hasUnavailable = drawerLines.some((l) => l.warning);
  const belowMin = !!quote && quote.minOrderPaise > 0 && quote.subtotalPaise < quote.minOrderPaise;
  const toFree = quote && quote.freeDeliveryAbovePaise > 0 && quote.subtotalPaise < quote.freeDeliveryAbovePaise && quote.deliveryFeePaise > 0 ? quote.freeDeliveryAbovePaise - quote.subtotalPaise : 0;
  const hint = belowMin && quote ? `Minimum order is ${formatPaise(quote.minOrderPaise)}. Add ${formatPaise(quote.minOrderPaise - quote.subtotalPaise)} more.` : toFree ? `Add ${formatPaise(toFree)} more for free delivery. Delivery and total are shown at checkout.` : 'Delivery fee and total are shown at checkout.';

  const cartBar: CartBarProps | undefined = lines.length
    ? { countLabel: count === 1 ? '1 item' : `${count} items`, totalLabel: quote ? formatPaise(quote.subtotalPaise) : undefined, actionLabel: 'View cart', isUpdating: !q.isCurrent && !q.error, onClick: cartActions.openDrawer }
    : undefined;

  const drawer: CartDrawerProps | undefined = isOpen
    ? {
        title: 'Your cart',
        closeLabel: 'Close cart',
        onClose: () => {
          cartActions.closeDrawer();
          cartActions.setNotice(undefined);
        },
        lines: drawerLines,
        emptyMessage: 'Your cart is empty. Add something tasty from the menu.',
        notice: q.error ? { kind: 'error', text: q.error } : notice ? { kind: 'info', text: notice, onDismiss: () => cartActions.setNotice(undefined) } : undefined,
        rows: [{ label: 'Subtotal', value: quote ? formatPaise(quote.subtotalPaise) : '…', isStrong: true }],
        isPriceUpdating: !q.isCurrent && !q.error,
        hint,
        checkoutButton: {
          label: 'Go to checkout',
          isDisabled: !quote || !!q.error || hasUnavailable || belowMin,
          onClick: () => {
            cartActions.closeDrawer();
            router.push('/checkout');
          },
        },
        clearButton: { label: 'Empty cart', onClick: () => cartActions.clear() },
      }
    : undefined;

  return { cartBar, drawer };
}
