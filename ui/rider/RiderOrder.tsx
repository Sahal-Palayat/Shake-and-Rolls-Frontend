import { Button } from '../common/Button';
import { Notice, type NoticeProps } from '../common/Notice';
import { StatusBadge, type StatusTone } from '../common/StatusBadge';
import { TextField, type TextFieldProps } from '../common/TextField';
import s from './rider.module.css';

export type RiderOrderViewProps = {
  title: string;
  badge: { label: string; tone: StatusTone };
  customerName: string;
  phoneLabel: string;
  call?: { label: string; href: string };
  addressLabel: string;
  maps?: { label: string; href: string };
  customerNote?: string;
  customerNoteLabel: string;
  itemsTitle: string;
  lines: { id: string; text: string; optionsText?: string; note?: string }[];
  payment: { title: string; totalLabel: string; statusLabel: string; isCashDue: boolean; dueLabel?: string; collectedLabel?: string };
  placedLabel: string;
  /** The one next step. Absent once the order is closed, or while the cash panel is open. */
  action?: { label: string; isBusy: boolean; onClick: () => void };
  cashPanel?: {
    title: string;
    dueLabel: string;
    field: TextFieldProps;
    confirmLabel: string;
    isBusy: boolean;
    onConfirm: () => void;
    cancelLabel: string;
    onCancel: () => void;
  };
  isClosed: boolean;
  closedLabel: string;
  backToListLabel: string;
};

export type RiderOrderProps = {
  backButton: { label: string; onClick: () => void };
  isLoading: boolean;
  loadingLabel: string;
  notice?: NoticeProps;
  live: { label: string; isLive: boolean };
  /** Not found / not yours / server error. */
  message?: { text: string; actionLabel: string; onAction: () => void };
  order?: RiderOrderViewProps;
};

export function RiderOrder(p: RiderOrderProps) {
  const o = p.order;
  return (
    <>
      <button type="button" className={s.back} onClick={p.backButton.onClick}>{p.backButton.label}</button>
      {p.notice ? <Notice {...p.notice} /> : null}
      {p.isLoading && !o ? <p className={s.center} role="status">{p.loadingLabel}</p> : null}
      {p.message && !o ? (
        <div className={s.center} role="alert">
          <p>{p.message.text}</p>
          <Button label={p.message.actionLabel} variant="secondary" onClick={p.message.onAction} />
        </div>
      ) : null}
      {o ? (
        <>
          <div className={s.titleRow}>
            <h1 className={s.h1}>{o.title}</h1>
            <StatusBadge label={o.badge.label} tone={o.badge.tone} />
          </div>
          <span className={`${s.live} ${p.live.isLive ? s.liveOn : ''}`}>{p.live.isLive ? '● ' : '○ '}{p.live.label}</span>

          <section className={s.card}>
            <span className={s.big}>{o.customerName}</span>
            <span>{o.phoneLabel}</span>
            <span className={s.big}>{o.addressLabel}</span>
            <div className={s.btnRow}>
              {o.call ? <a className={s.linkBtn} href={o.call.href}>📞 {o.call.label}</a> : null}
              {o.maps ? <a className={s.linkBtn} href={o.maps.href} target="_blank" rel="noopener noreferrer">📍 {o.maps.label}</a> : null}
            </div>
            {o.customerNote ? (
              <div className={s.note} role="note">
                <span className={s.noteLabel}>{o.customerNoteLabel}</span>
                {o.customerNote}
              </div>
            ) : null}
          </section>

          <section className={s.card}>
            <h2 className={s.cardTitle}>{o.itemsTitle}</h2>
            <ul className={s.lines}>
              {o.lines.map((l) => (
                <li key={l.id} className={s.line}>
                  {l.text}
                  {l.optionsText ? <span className={s.opts}>{l.optionsText}</span> : null}
                  {l.note ? <span className={s.lineNote}>📝 {l.note}</span> : null}
                </li>
              ))}
            </ul>
          </section>

          <section className={s.card}>
            <h2 className={s.cardTitle}>{o.payment.title}</h2>
            <div className={s.pay}>
              <span className={s.big}>{o.payment.totalLabel}</span>
              <span>{o.payment.statusLabel}</span>
            </div>
            {o.payment.dueLabel ? <div className={s.dueBox}>{o.payment.dueLabel}</div> : null}
            {o.payment.collectedLabel ? <div className={s.doneBox}>✓ {o.payment.collectedLabel}</div> : null}
            <span className={s.muted}>{o.placedLabel}</span>
          </section>

          {o.cashPanel ? (
            <section className={s.actionBar} aria-label={o.cashPanel.title}>
              <div className={s.cashPanel}>
                <h2 className={s.cardTitle}>{o.cashPanel.title}</h2>
                <div className={s.dueBox}>{o.cashPanel.dueLabel}</div>
                <TextField {...o.cashPanel.field} />
                <Button label={o.cashPanel.confirmLabel} variant="primary" onClick={o.cashPanel.onConfirm} isLoading={o.cashPanel.isBusy} />
                <Button label={o.cashPanel.cancelLabel} variant="ghost" onClick={o.cashPanel.onCancel} isDisabled={o.cashPanel.isBusy} />
              </div>
            </section>
          ) : null}

          {o.action ? (
            <div className={s.actionBar}>
              <Button label={o.action.label} variant="primary" onClick={o.action.onClick} isLoading={o.action.isBusy} />
            </div>
          ) : null}

          {o.isClosed ? (
            <div className={s.actionBar}>
              {o.closedLabel ? <p className={s.muted} role="status">{o.closedLabel}</p> : null}
              <Button label={o.backToListLabel} variant="secondary" onClick={p.backButton.onClick} />
            </div>
          ) : null}
        </>
      ) : null}
    </>
  );
}
