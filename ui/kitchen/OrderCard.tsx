import { Button } from '../common/Button';
import { StatusBadge, type StatusTone } from '../common/StatusBadge';
import s from './kitchen.module.css';

export type OrderCardAction = { label: string; variant: 'primary' | 'secondary' | 'danger' | 'ghost'; onClick: () => void };
export type OrderCardLine = { id: string; text: string; optionsText?: string; note?: string };

export type OrderCardProps = {
  id: string;
  orderNumber: string;
  ageLabel: string;
  badge: { label: string; tone: StatusTone };
  isDelayed: boolean;
  fulfillmentLabel: string; // "Delivery" | "Pickup"
  isPickup: boolean;
  customerLabel: string;
  addressLabel: string;
  lines: OrderCardLine[];
  customerNote?: string;
  customerNoteLabel: string;
  totalLabel: string;
  paymentLabel: string;
  isBusy: boolean;
  actions: OrderCardAction[];
};

export function OrderCard(p: OrderCardProps) {
  return (
    <article className={`${s.card} ${p.isDelayed ? s.cardDelayed : ''}`} aria-label={`Order ${p.orderNumber}`}>
      <div className={s.cardTop}>
        <span className={s.num}>{p.orderNumber}</span>
        <span className={`${s.fulfil} ${p.isPickup ? s.fulfilPickup : ''}`}>{p.isPickup ? '🛍 ' : '🛵 '}{p.fulfillmentLabel}</span>
        <StatusBadge label={p.badge.label} tone={p.badge.tone} />
      </div>
      <div className={s.cardTop}>
        <span className={s.who}>{p.customerLabel}</span>
        <span className={s.age}>{p.ageLabel}</span>
      </div>
      <div className={s.addr}>{p.addressLabel}</div>
      {p.customerNote ? (
        <div className={s.custNote} role="note">
          <span className={s.custNoteLabel}>{p.customerNoteLabel}</span>
          {p.customerNote}
        </div>
      ) : null}
      <ul className={s.lines}>
        {p.lines.map((l) => (
          <li key={l.id} className={s.line}>
            {l.text}
            {l.optionsText ? <span className={s.opts}>{l.optionsText}</span> : null}
            {l.note ? <span className={s.lineNote}>📝 {l.note}</span> : null}
          </li>
        ))}
      </ul>
      <div className={s.meta}>
        <span>{p.totalLabel}</span>
        <span>{p.paymentLabel}</span>
      </div>
      {p.actions.length ? (
        <div className={s.btns}>
          {p.actions.map((a) => <Button key={a.label} label={a.label} variant={a.variant} onClick={a.onClick} isDisabled={p.isBusy} />)}
        </div>
      ) : null}
    </article>
  );
}
