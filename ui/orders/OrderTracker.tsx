import { Button } from '../common/Button';
import { Notice, type NoticeProps } from '../common/Notice';
import { StatusBadge, type StatusTone } from '../common/StatusBadge';
import { OtpPanel, type OtpPanelProps } from '../auth/OtpPanel';
import s from './orders.module.css';

export type TrackerStepProps = { id: string; label: string; timeLabel?: string; state: 'done' | 'current' | 'todo'; stateLabel: string };
export type TrackerOrderProps = {
  title: string; // "Order SR-K7M2QX"
  badge: { label: string; tone: StatusTone };
  headline: string;
  detail: string;
  stepsLabel: string;
  steps: TrackerStepProps[];
  detailsTitle: string;
  info: { label: string; value: string }[];
  items: { id: string; name: string; quantityLabel: string; optionsText?: string; note?: string; priceLabel: string }[];
  rows: { label: string; value: string; isStrong?: boolean }[];
  reorderButton: { label: string; onClick: () => void; isLoading: boolean };
};

export type OrderTrackerProps = {
  backButton: { label: string; onClick: () => void };
  isLoading: boolean;
  loadingLabel: string;
  notice?: NoticeProps;
  /** Order not found / not yours / server error. */
  message?: { text: string; actionLabel?: string; onAction?: () => void };
  verify?: OtpPanelProps;
  live?: { label: string; isLive: boolean };
  order?: TrackerOrderProps;
};

const MARK = { done: '✓', current: '●', todo: '' } as const;

export function OrderTracker(p: OrderTrackerProps) {
  return (
    <div className={s.page}>
      <button type="button" className={s.back} onClick={p.backButton.onClick}>{p.backButton.label}</button>
      {p.notice ? <Notice {...p.notice} /> : null}

      {p.verify ? <OtpPanel {...p.verify} /> : null}

      {p.isLoading ? (
        <div className={s.skeleton} aria-busy="true" aria-label={p.loadingLabel} />
      ) : p.message ? (
        <div className={s.center} role="status">
          <p className={s.centerText}>{p.message.text}</p>
          {p.message.actionLabel && p.message.onAction ? <Button label={p.message.actionLabel} variant="primary" onClick={p.message.onAction} /> : null}
        </div>
      ) : p.order ? (
        <>
          <div className={s.titleRow}>
            <h1 className={s.title}>{p.order.title}</h1>
            {p.live ? <span className={`${s.live} ${p.live.isLive ? s.liveOn : ''}`}><span className={s.liveDot} aria-hidden="true" />{p.live.label}</span> : null}
          </div>

          <section className={s.status} aria-live="polite">
            <div><StatusBadge label={p.order.badge.label} tone={p.order.badge.tone} /></div>
            <h2 className={s.headline}>{p.order.headline}</h2>
            <p className={s.detail}>{p.order.detail}</p>
          </section>

          <ol className={s.steps} aria-label={p.order.stepsLabel}>
            {p.order.steps.map((st) => (
              <li key={st.id} className={`${s.step} ${st.state === 'done' ? s.stepDone : st.state === 'current' ? s.stepCurrent : s.stepTodo}`} aria-current={st.state === 'current' ? 'step' : undefined}>
                <span className={s.mark} aria-hidden="true">{MARK[st.state]}</span>
                <span className={s.stepLabel}>{st.label}<span className="sr-only"> ({st.stateLabel})</span></span>
                <span className={s.stepTime}>{st.timeLabel ?? ''}</span>
              </li>
            ))}
          </ol>

          <section className={s.ticket} aria-labelledby="detail-title">
            <h2 id="detail-title" className={s.ticketTitle}>{p.order.detailsTitle}</h2>
            <dl className={s.info}>
              {p.order.info.map((r) => (
                <div key={r.label} className={s.infoRow}><dt>{r.label}</dt><dd>{r.value}</dd></div>
              ))}
            </dl>
            <ul className={s.items}>
              {p.order.items.map((i) => (
                <li key={i.id} className={s.item}>
                  <span className={s.itemText}>
                    <span className={s.itemName}>{i.quantityLabel} × {i.name}</span>
                    {i.optionsText ? <span className={s.itemOpts}>{i.optionsText}</span> : null}
                    {i.note ? <span className={s.itemNote}>“{i.note}”</span> : null}
                  </span>
                  <span className={s.itemPrice}>{i.priceLabel}</span>
                </li>
              ))}
            </ul>
            <dl className={s.rows}>
              {p.order.rows.map((r) => (
                <div key={r.label} className={`${s.row} ${r.isStrong ? s.rowStrong : ''}`}><dt>{r.label}</dt><dd className={s.rowValue}>{r.value}</dd></div>
              ))}
            </dl>
          </section>

          <div className={s.actions}>
            <Button label={p.order.reorderButton.label} variant="primary" onClick={p.order.reorderButton.onClick} isLoading={p.order.reorderButton.isLoading} />
          </div>
        </>
      ) : null}
    </div>
  );
}
