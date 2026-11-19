import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { CheckoutViewProps } from '@/ui/checkout/CheckoutView';
import type { NoticeProps } from '@/ui/common/Notice';
import { Fulfillment } from '@/types/enums';
import { api, errorText, unwrap } from '@/features/api/client';
import { useCustomerAuth } from '@/features/auth/useCustomerAuth';
import { toOrderLines } from '@/features/cart/cart';
import { cartActions, useCartLines } from '@/features/cart/cartStore';
import { useQuote } from '@/features/cart/useQuote';
import { formatPaise } from '@/features/common/format';
import { useHydrated } from '@/features/common/useHydrated';
import { clearIdempotencyKey, idempotencyKeyFor } from './idempotency';

type Form = { name: string; line1: string; area: string; landmark: string; pincode: string; note: string };
type Errors = Partial<Record<keyof Form, string>>;

export function useCheckout(): CheckoutViewProps & { isLoading: boolean } {
  const router = useRouter();
  const hydrated = useHydrated();
  const lines = useCartLines();
  const auth = useCustomerAuth({ title: 'Verify your mobile number', description: 'We text you a code so the shop can reach you about this order.' });
  const [fulfillment, setFulfillment] = useState<Fulfillment>(Fulfillment.Delivery);
  const [form, setForm] = useState<Form>({ name: '', line1: '', area: '', landmark: '', pincode: '', note: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [isPlacing, setPlacing] = useState(false);
  const [notice, setNotice] = useState<NoticeProps | undefined>();
  const q = useQuote(lines, fulfillment, hydrated);
  const quote = q.isCurrent ? q.quote : undefined;
  const isPickup = fulfillment === Fulfillment.Pickup;

  const set = (k: keyof Form) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.name.trim()) e.name = 'Enter your name.';
    if (!isPickup && !form.line1.trim()) e.line1 = 'Enter your delivery address.';
    if (form.pincode.trim() && !/^\d{6}$/.test(form.pincode.trim())) e.pincode = 'Pincode is 6 digits.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const placeOrder = async () => {
    if (!auth.session || !validate()) return;
    const body = {
      lines: toOrderLines(lines),
      fulfillment,
      paymentMethod: 'cod' as const,
      contactName: form.name.trim(),
      contactPhone: auth.session.user.phone ?? '',
      ...(isPickup ? {} : { deliveryAddress: { line1: form.line1.trim(), ...(form.area.trim() ? { area: form.area.trim() } : {}), ...(form.landmark.trim() ? { landmark: form.landmark.trim() } : {}), ...(form.pincode.trim() ? { pincode: form.pincode.trim() } : {}) } }),
      ...(form.note.trim() ? { customerNote: form.note.trim() } : {}),
    };
    setPlacing(true);
    setNotice(undefined);
    try {
      const order = await unwrap(api.POST('/api/orders', { params: { header: { 'Idempotency-Key': idempotencyKeyFor(JSON.stringify(body)) } }, body }));
      clearIdempotencyKey();
      cartActions.clear();
      router.replace(`/orders/${order.id}`);
    } catch (e) {
      setNotice({ kind: 'error', text: errorText(e), onDismiss: () => setNotice(undefined) });
    } finally {
      setPlacing(false);
    }
  };

  // why the order can't be placed yet, in priority order
  let blocked: string | undefined;
  if (!auth.isSignedIn) blocked = 'Verify your mobile number to place your order.';
  else if (q.error) blocked = q.error;
  else if (quote && quote.minOrderPaise > 0 && quote.subtotalPaise < quote.minOrderPaise) blocked = `Minimum order is ${formatPaise(quote.minOrderPaise)}. Add ${formatPaise(quote.minOrderPaise - quote.subtotalPaise)} more.`;
  else if (quote && quote.totalPaise > quote.maxCodPaise) blocked = `Cash on delivery is limited to ${formatPaise(quote.maxCodPaise)}. Reduce your order.`;

  const toFree = quote && !isPickup && quote.freeDeliveryAbovePaise > 0 && quote.subtotalPaise < quote.freeDeliveryAbovePaise && quote.deliveryFeePaise > 0 ? quote.freeDeliveryAbovePaise - quote.subtotalPaise : 0;
  const field = (id: keyof Form, label: string, extra: Partial<CheckoutViewProps['details']['nameField']> = {}) => ({ id: `co-${id}`, label, value: form[id], onChange: set(id), errorMessage: errors[id], isDisabled: isPlacing, ...extra });

  return {
    isLoading: !hydrated || !auth.isReady,
    title: 'Checkout',
    backButton: { label: 'Back to menu', onClick: () => router.push('/') },
    notice,
    emptyState: hydrated && lines.length === 0 ? { text: 'Your cart is empty.', actionLabel: 'See the menu', onAction: () => router.push('/') } : undefined,
    verify: auth.isSignedIn ? undefined : auth.otpPanel,
    signedInText: auth.isSignedIn ? `Ordering with ${auth.phoneLabel}` : undefined,
    fulfillment: {
      legend: 'How do you want it?',
      name: 'fulfillment',
      value: fulfillment,
      onChange: (v) => setFulfillment(v as Fulfillment),
      options: [
        { value: Fulfillment.Delivery, label: 'Delivery', description: 'Brought to your door.' },
        { value: Fulfillment.Pickup, label: 'Pickup', description: 'Collect it from the shop. No delivery fee.' },
      ],
    },
    details: {
      legend: 'Your details',
      nameField: field('name', 'Name', { autoComplete: 'name', maxLength: 80 }),
      addressLegend: 'Delivery address',
      address: isPickup ? undefined : { line1: field('line1', 'Address', { autoComplete: 'address-line1', maxLength: 200, placeholder: 'House / flat, street' }), area: field('area', 'Area (optional)', { maxLength: 100 }), landmark: field('landmark', 'Landmark (optional)', { maxLength: 150 }), pincode: field('pincode', 'Pincode (optional)', { inputMode: 'numeric', maxLength: 6, autoComplete: 'postal-code' }) },
      pickupText: isPickup ? 'We will tell you on the next screen when it is ready to collect.' : undefined,
      noteField: field('note', 'Note for the shop (optional)', { maxLength: 300 }),
    },
    payment: {
      legend: 'Payment',
      name: 'payment',
      value: 'cod',
      onChange: () => {},
      options: [
        { value: 'cod', label: 'Cash', description: isPickup ? 'Pay in cash when you collect.' : 'Pay in cash when it arrives.' },
        { value: 'online', label: 'Pay online', description: 'UPI, cards and netbanking.', badge: 'Coming soon', isDisabled: true },
      ],
    },
    summary: {
      title: 'Your order',
      items: lines.map((l, i) => {
        const ql = quote?.lines[i];
        return { id: l.key, name: ql?.name ?? l.name, quantityLabel: String(l.quantity), optionsText: ql?.options.length ? ql.options.map((o) => o.name).join(', ') : undefined, priceLabel: ql ? formatPaise(ql.lineTotalPaise) : '…' };
      }),
      rows: [
        { label: 'Subtotal', value: quote ? formatPaise(quote.subtotalPaise) : '…' },
        { label: isPickup ? 'Pickup' : 'Delivery fee', value: quote ? (quote.deliveryFeePaise === 0 ? 'Free' : formatPaise(quote.deliveryFeePaise)) : '…' },
        { label: 'Total to pay', value: quote ? formatPaise(quote.totalPaise) : '…', isStrong: true },
      ],
      isUpdating: !q.isCurrent && !q.error,
      hint: toFree ? `Add ${formatPaise(toFree)} more for free delivery.` : undefined,
    },
    blockedMessage: blocked,
    placeOrder: { label: quote ? `Place order · ${formatPaise(quote.totalPaise)}` : 'Place order', isDisabled: !!blocked || !quote || isPlacing, isLoading: isPlacing, onClick: () => void placeOrder() },
  };
}
