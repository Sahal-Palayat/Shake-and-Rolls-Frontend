import { Button } from '../common/Button';
import { Notice, type NoticeProps } from '../common/Notice';
import { StatusBadge, type StatusTone } from '../common/StatusBadge';
import { OtpPanel, type OtpPanelProps } from '../auth/OtpPanel';
import s from './orders.module.css';

export type HistoryOrderProps = {
  id: string;
  orderNumber: string;
  dateLabel: string;
  badge: { label: string; tone: StatusTone };
  fulfillmentLabel: string;
  summaryText: string; // "2 × Paneer Wrap, 1 × Mango Shake"
  totalLabel: string;
  openAriaLabel: string;
  onOpen: () => void;
  reorder: { label: string; isLoading: boolean; onClick: () => void };
};

export type OrdersHistoryProps = {
  title: string;
  isLoading: boolean;
  loadingLabel: string;
  notice?: NoticeProps;
  verify?: OtpPanelProps;
  message?: { text: string; actionLabel?: string; onAction?: () => void };
  orders: HistoryOrderProps[];
};

export function OrdersHistory(p: OrdersHistoryProps) {
  return (
    <div className={s.page}>
      <h1 className={s.title}>{p.title}</h1>
      {p.notice ? <Notice {...p.notice} /> : null}
      {p.verify ? <OtpPanel {...p.verify} /> : null}

      {p.isLoading ? (
        <ul className={s.list} aria-busy="true" aria-label={p.loadingLabel}>
          {[0, 1, 2].map((i) => <li key={i} className={s.skeleton} />)}
        </ul>
      ) : p.message ? (
        <div className={s.center} role="status">
          <p className={s.centerText}>{p.message.text}</p>
          {p.message.actionLabel && p.message.onAction ? <Button label={p.message.actionLabel} variant="primary" onClick={p.message.onAction} /> : null}
        </div>
      ) : (
        <ul className={s.list}>
          {p.orders.map((o) => (
            <li key={o.id} className={s.card}>
              <div className={s.cardTop}>
                <button type="button" className={s.cardOpen} onClick={o.onOpen} aria-label={o.openAriaLabel}>{o.orderNumber}</button>
                <StatusBadge label={o.badge.label} tone={o.badge.tone} />
              </div>
              <span className={s.cardMeta}><span>{o.dateLabel}</span><span>{o.fulfillmentLabel}</span></span>
              <p className={s.cardSummary}>{o.summaryText}</p>
              <div className={s.cardBottom}>
                <span className={s.cardTotal}>{o.totalLabel}</span>
                <Button label={o.reorder.label} variant="ghost" size="sm" onClick={o.reorder.onClick} isLoading={o.reorder.isLoading} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
