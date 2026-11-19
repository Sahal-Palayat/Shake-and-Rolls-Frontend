import { Fragment } from 'react';
import { Button } from '../common/Button';
import { Dialog } from '../common/Dialog';
import { Notice } from '../common/Notice';
import { SelectField } from '../common/SelectField';
import { StatusBadge, type StatusTone } from '../common/StatusBadge';
import { TextField } from '../common/TextField';
import s from './orders-admin.module.css';

export type DetailAction = { label: string; variant: 'primary' | 'secondary' | 'danger' | 'ghost'; onClick: () => void };

export type OrderDetailDialogProps = {
  title: string;
  badge: { label: string; tone: StatusTone };
  info: { label: string; value: string }[];
  lines: { id: string; text: string; amountLabel: string }[];
  totalLabel: string;
  customerNote?: string;
  log: { id: string; text: string }[];
  errorMessage?: string;
  isBusy: boolean;
  actions: DetailAction[];
  reason: { value: string; onChange: (v: string) => void; hint: string };
  assign?: { label: string; riderOptions: { value: string; label: string }[]; value: string; onChange: (v: string) => void; onSubmit: () => void };
  override: {
    heading: string;
    statusOptions: { value: string; label: string }[];
    status: string;
    onStatusChange: (v: string) => void;
    riderPicker?: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void };
    onSubmit: () => void;
  };
  onClose: () => void;
};

export function OrderDetailDialog(p: OrderDetailDialogProps) {
  return (
    <Dialog title={p.title} onClose={p.onClose} isWide actions={<Button label="Close" onClick={p.onClose} />}>
      <StatusBadge label={p.badge.label} tone={p.badge.tone} />
      {p.errorMessage ? <Notice kind="error" text={p.errorMessage} /> : null}
      <section className={s.section}>
        <dl className={s.info}>{p.info.map((i) => (<Fragment key={i.label}><dt>{i.label}</dt><dd>{i.value}</dd></Fragment>))}</dl>
        {p.customerNote ? <div className={s.note}>📝 {p.customerNote}</div> : null}
      </section>
      <section className={s.section} aria-label="Items">
        <h3 className={s.h2}>Items</h3>
        <ul className={s.list}>{p.lines.map((l) => <li key={l.id} className={s.lineRow}><span>{l.text}</span><strong>{l.amountLabel}</strong></li>)}</ul>
        <div className={s.lineRow}><strong>Total</strong><strong>{p.totalLabel}</strong></div>
      </section>

      <section className={s.section} aria-label="Actions">
        <h3 className={s.h2}>Actions</h3>
        <TextField id="od-reason" label="Reason" value={p.reason.value} onChange={p.reason.onChange} hint={p.reason.hint} maxLength={200} />
        {p.assign ? (
          <div className={s.inline}>
            <SelectField id="od-rider" label="Rider" value={p.assign.value} options={p.assign.riderOptions} onChange={p.assign.onChange} />
            <Button label={p.assign.label} variant="primary" onClick={p.assign.onSubmit} isDisabled={p.isBusy || !p.assign.value} />
          </div>
        ) : null}
        <div className={s.btns}>{p.actions.map((a) => <Button key={a.label} label={a.label} variant={a.variant} onClick={a.onClick} isDisabled={p.isBusy} />)}</div>
      </section>

      <section className={s.section} aria-label="Override">
        <h3 className={s.h2}>{p.override.heading}</h3>
        <div className={s.inline}>
          <SelectField id="od-ov-status" label="Set status to" value={p.override.status} options={p.override.statusOptions} onChange={p.override.onStatusChange} />
          <Button label="Apply override" variant="secondary" onClick={p.override.onSubmit} isDisabled={p.isBusy || !p.override.status} />
        </div>
        {p.override.riderPicker ? <SelectField id="od-ov-rider" label="Rider for this status" value={p.override.riderPicker.value} options={p.override.riderPicker.options} onChange={p.override.riderPicker.onChange} /> : null}
      </section>

      <section className={s.section} aria-label="History">
        <h3 className={s.h2}>History</h3>
        <ul className={s.list}>{p.log.map((l) => <li key={l.id} className={s.logRow}>{l.text}</li>)}</ul>
      </section>
    </Dialog>
  );
}
