import { Button } from '../common/Button';
import { Notice, type NoticeProps } from '../common/Notice';
import { TextField, type TextFieldProps } from '../common/TextField';
import { OtpPanel, type OtpPanelProps } from '../auth/OtpPanel';
import s from './checkout.module.css';

export type ChoiceProps = { value: string; label: string; description?: string; badge?: string; isDisabled?: boolean };
export type ChoiceGroupProps = { legend: string; name: string; value: string; options: ChoiceProps[]; onChange: (value: string) => void };
export type CheckoutItemProps = { id: string; name: string; quantityLabel: string; optionsText?: string; priceLabel: string; warning?: string };
export type CheckoutRowProps = { label: string; value: string; isStrong?: boolean };

export type CheckoutViewProps = {
  isLoading?: boolean;
  title: string;
  backButton: { label: string; onClick: () => void };
  notice?: NoticeProps;
  /** Whole screen replaced by a message (cart empty). */
  emptyState?: { text: string; actionLabel: string; onAction: () => void };
  /** Present while the customer still has to prove their number. */
  verify?: OtpPanelProps;
  /** Present once verified. */
  signedInText?: string;
  fulfillment: ChoiceGroupProps;
  details: {
    legend: string;
    nameField: TextFieldProps;
    addressLegend: string;
    /** Absent for pickup. */
    address?: { line1: TextFieldProps; area: TextFieldProps; landmark: TextFieldProps; pincode: TextFieldProps };
    pickupText?: string;
    noteField: TextFieldProps;
  };
  payment: ChoiceGroupProps;
  summary: { title: string; items: CheckoutItemProps[]; rows: CheckoutRowProps[]; isUpdating: boolean; hint?: string };
  blockedMessage?: string; // why the order cannot be placed yet (below minimum, item gone, ...)
  placeOrder: { label: string; isDisabled: boolean; isLoading: boolean; onClick: () => void };
};

function Choices(p: ChoiceGroupProps) {
  return (
    <fieldset className={s.section}>
      <legend className={s.legend}>{p.legend}</legend>
      <div className={s.choices}>
        {p.options.map((o) => (
          <label key={o.value} className={s.choice}>
            <input type="radio" name={p.name} value={o.value} checked={p.value === o.value} disabled={o.isDisabled} onChange={() => p.onChange(o.value)} />
            <span className={s.choiceText}>
              <span className={s.choiceLabel}>{o.label}</span>
              {o.description ? <span className={s.choiceDesc}>{o.description}</span> : null}
              {o.badge ? <span className={s.badge}>{o.badge}</span> : null}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function CheckoutView(p: CheckoutViewProps) {
  if (p.isLoading) return <div className={s.page}><div className={s.center} role="status" aria-busy="true"><div className={s.spinner} /><p className={s.centerText}>Loading your cart</p></div></div>;
  if (p.emptyState) {
    return (
      <div className={s.page}>
        <div className={s.center} role="status">
          <p className={s.centerText}>{p.emptyState.text}</p>
          <Button label={p.emptyState.actionLabel} variant="primary" onClick={p.emptyState.onAction} />
        </div>
      </div>
    );
  }
  return (
    <div className={s.page}>
      <button type="button" className={s.back} onClick={p.backButton.onClick}>{p.backButton.label}</button>
      <h1 className={s.title}>{p.title}</h1>
      {p.notice ? <Notice {...p.notice} /> : null}

      {p.verify ? <OtpPanel {...p.verify} /> : p.signedInText ? <p className={s.who}>{p.signedInText}</p> : null}

      <Choices {...p.fulfillment} />

      <fieldset className={s.section}>
        <legend className={s.legend}>{p.details.legend}</legend>
        <TextField {...p.details.nameField} />
        {p.details.address ? (
          <>
            <TextField {...p.details.address.line1} />
            <div className={s.twoCol}>
              <TextField {...p.details.address.area} />
              <TextField {...p.details.address.pincode} />
            </div>
            <TextField {...p.details.address.landmark} />
          </>
        ) : p.details.pickupText ? (
          <p className={s.hint}>{p.details.pickupText}</p>
        ) : null}
        <TextField {...p.details.noteField} isMultiline />
      </fieldset>

      <Choices {...p.payment} />

      <section className={s.ticket} aria-labelledby="ticket-title">
        <h2 id="ticket-title" className={s.ticketTitle}>{p.summary.title}</h2>
        <ul className={s.items}>
          {p.summary.items.map((i) => (
            <li key={i.id} className={s.item}>
              <span className={s.itemText}>
                <span className={s.itemName}>{i.quantityLabel} × {i.name}</span>
                {i.optionsText ? <span className={s.itemOpts}>{i.optionsText}</span> : null}
                {i.warning ? <span className={s.itemWarn} role="alert">⚠ {i.warning}</span> : null}
              </span>
              <span className={s.itemPrice}>{i.priceLabel}</span>
            </li>
          ))}
        </ul>
        <dl className={`${s.rows} ${p.summary.isUpdating ? s.updating : ''}`} aria-busy={p.summary.isUpdating || undefined}>
          {p.summary.rows.map((r) => (
            <div key={r.label} className={`${s.row} ${r.isStrong ? s.rowStrong : ''}`}>
              <dt>{r.label}</dt>
              <dd className={s.rowValue}>{r.value}</dd>
            </div>
          ))}
        </dl>
        {p.summary.hint ? <p className={s.hint}>{p.summary.hint}</p> : null}
      </section>

      <div className={s.footer}>
        {p.blockedMessage ? <span className={s.blocked} role="alert">⚠ {p.blockedMessage}</span> : null}
        <Button label={p.placeOrder.label} variant="primary" isFullWidth isDisabled={p.placeOrder.isDisabled} isLoading={p.placeOrder.isLoading} onClick={p.placeOrder.onClick} />
      </div>
    </div>
  );
}
