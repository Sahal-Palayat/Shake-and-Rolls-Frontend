import { Button } from '../common/Button';
import { Notice, type NoticeProps } from '../common/Notice';
import { QuantityStepper, type QuantityStepperProps } from '../common/QuantityStepper';
import { Sheet } from '../common/Sheet';
import { VegMark } from '../common/VegMark';
import s from './cart.module.css';

export type CartDrawerLineProps = {
  id: string;
  name: string;
  isVeg: boolean;
  vegLabel: string;
  optionsText?: string;
  note?: string;
  priceLabel: string; // server price for this line; "…" while pricing
  warning?: string; // "No longer available"
  quantity: QuantityStepperProps;
  removeLabel: string;
  onRemove: () => void;
};
export type SummaryRowProps = { label: string; value: string; isStrong?: boolean };

export type CartDrawerProps = {
  title: string;
  closeLabel: string;
  onClose: () => void;
  lines: CartDrawerLineProps[];
  emptyMessage: string;
  notice?: NoticeProps;
  rows: SummaryRowProps[];
  isPriceUpdating: boolean;
  hint?: string; // "Delivery fee is shown at checkout"
  checkoutButton: { label: string; isDisabled: boolean; onClick: () => void };
  clearButton: { label: string; onClick: () => void };
};

export function CartDrawer(p: CartDrawerProps) {
  const isEmpty = p.lines.length === 0;
  return (
    <Sheet
      title={p.title}
      closeLabel={p.closeLabel}
      onClose={p.onClose}
      placement="right"
      footer={
        isEmpty ? undefined : (
          <>
            <dl className={`${s.rows} ${p.isPriceUpdating ? s.updating : ''}`} aria-busy={p.isPriceUpdating || undefined}>
              {p.rows.map((r) => (
                <div key={r.label} className={`${s.row} ${r.isStrong ? s.rowStrong : ''}`}>
                  <dt>{r.label}</dt>
                  <dd className={s.rowValue}>{r.value}</dd>
                </div>
              ))}
            </dl>
            {p.hint ? <p className={s.hint}>{p.hint}</p> : null}
            <Button label={p.checkoutButton.label} variant="primary" isFullWidth isDisabled={p.checkoutButton.isDisabled} onClick={p.checkoutButton.onClick} />
            <Button label={p.clearButton.label} variant="ghost" size="sm" onClick={p.clearButton.onClick} />
          </>
        )
      }
    >
      {p.notice ? <Notice {...p.notice} /> : null}
      {isEmpty ? (
        <p className={s.empty}>{p.emptyMessage}</p>
      ) : (
        <ul className={s.lines}>
          {p.lines.map((l) => (
            <li key={l.id} className={s.line}>
              <div className={s.lineMain}>
                <span className={s.lineName}><VegMark isVeg={l.isVeg} label={l.vegLabel} />{l.name}</span>
                {l.optionsText ? <span className={s.lineOpts}>{l.optionsText}</span> : null}
                {l.note ? <span className={s.lineNote}>“{l.note}”</span> : null}
                {l.warning ? <span className={s.lineWarn} role="alert">⚠ {l.warning}</span> : null}
              </div>
              <span className={s.linePrice}>{l.priceLabel}</span>
              <div className={s.lineActions}>
                <QuantityStepper {...l.quantity} size="sm" />
                <button type="button" className={s.remove} onClick={l.onRemove}>{l.removeLabel}</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
