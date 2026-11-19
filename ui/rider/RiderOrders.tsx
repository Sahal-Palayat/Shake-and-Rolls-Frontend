import { Button } from '../common/Button';
import { Notice, type NoticeProps } from '../common/Notice';
import { StatusBadge, type StatusTone } from '../common/StatusBadge';
import s from './rider.module.css';

export type RiderTileProps = {
  id: string;
  orderNumber: string;
  badge: { label: string; tone: StatusTone };
  customerLabel: string;
  addressLabel: string;
  ageLabel: string;
  totalLabel: string;
  paymentLabel: string; // "Collect ₹230 cash" | "Cash collected" | "Paid"
  isCashDue: boolean;
  openLabel: string;
  onOpen: () => void;
};

export type RiderOrdersProps = {
  title: string;
  tabsLabel: string;
  tabs: { id: string; label: string; isSelected: boolean; onSelect: () => void }[];
  isLoading: boolean;
  loadingLabel: string;
  notice?: NoticeProps;
  live: { label: string; isLive: boolean };
  orders: RiderTileProps[];
  emptyText: string;
  refreshLabel: string;
  onRefresh: () => void;
};

export function RiderOrders(p: RiderOrdersProps) {
  return (
    <>
      <div className={s.titleRow}>
        <h1 className={s.h1}>{p.title}</h1>
        <span className={`${s.live} ${p.live.isLive ? s.liveOn : ''}`}>{p.live.isLive ? '● ' : '○ '}{p.live.label}</span>
      </div>
      {p.notice ? <Notice {...p.notice} /> : null}
      <div className={s.tabs} role="tablist" aria-label={p.tabsLabel}>
        {p.tabs.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={t.isSelected} className={`${s.tab} ${t.isSelected ? s.tabOn : ''}`} onClick={t.onSelect}>
            {t.label}
          </button>
        ))}
      </div>
      {p.isLoading ? (
        <p className={s.center} role="status">{p.loadingLabel}</p>
      ) : p.orders.length === 0 ? (
        <p className={s.center}>{p.emptyText}</p>
      ) : (
        <ul className={s.list}>
          {p.orders.map((o) => (
            <li key={o.id}>
              <button type="button" className={`${s.tile} ${o.isCashDue ? s.tileCash : ''}`} onClick={o.onOpen} aria-label={`${o.openLabel} ${o.orderNumber}`}>
                <span className={s.tileTop}>
                  <span className={s.num}>{o.orderNumber}</span>
                  <StatusBadge label={o.badge.label} tone={o.badge.tone} />
                </span>
                <span className={s.tileTop}>
                  <span className={s.who2}>{o.customerLabel}</span>
                  <span className={s.age}>{o.ageLabel}</span>
                </span>
                <span className={s.addr}>{o.addressLabel}</span>
                <span className={s.tileFoot}>
                  <span>{o.totalLabel}</span>
                  <span className={o.isCashDue ? s.cashTag : undefined}>{o.isCashDue ? '₹ ' : ''}{o.paymentLabel}</span>
                  <span className={s.open}>{o.openLabel} ›</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <Button label={p.refreshLabel} variant="ghost" onClick={p.onRefresh} />
    </>
  );
}
