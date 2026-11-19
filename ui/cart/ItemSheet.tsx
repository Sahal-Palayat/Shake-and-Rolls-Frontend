import { Button } from '../common/Button';
import { QuantityStepper, type QuantityStepperProps } from '../common/QuantityStepper';
import { Sheet } from '../common/Sheet';
import { TextField, type TextFieldProps } from '../common/TextField';
import { VegMark } from '../common/VegMark';
import s from './cart.module.css';

export type ItemSheetOption = {
  id: string;
  label: string;
  priceLabel?: string; // "+₹30". Absent when free.
  isSelected: boolean;
  isDisabled: boolean;
  disabledLabel?: string; // "Sold out"
  onToggle: () => void;
};
export type ItemSheetGroup = {
  id: string;
  title: string;
  hint: string; // "Choose one" / "Choose up to 3"
  control: 'radio' | 'checkbox';
  options: ItemSheetOption[];
  errorMessage?: string;
};

export type ItemSheetProps = {
  title: string;
  description?: string;
  imageUrl?: string;
  isVeg: boolean;
  vegLabel: string;
  groups: ItemSheetGroup[];
  noteField: TextFieldProps;
  quantityLabel: string;
  quantity: QuantityStepperProps;
  /** The shop's own price for exactly this pick. Empty until the server has answered. */
  priceLabel: string;
  priceCaption: string;
  isPriceUpdating: boolean;
  errorMessage?: string;
  addButton: { label: string; isDisabled: boolean; onClick: () => void };
  closeLabel: string;
  onClose: () => void;
};

export function ItemSheet(p: ItemSheetProps) {
  return (
    <Sheet
      title={p.title}
      closeLabel={p.closeLabel}
      onClose={p.onClose}
      footer={
        <>
          <div className={s.priceBlock}>
            <span className={`${s.priceBig} ${p.isPriceUpdating ? s.updating : ''}`} aria-live="polite">{p.priceLabel || '…'}</span>
            <span className={s.priceCaption}>{p.priceCaption}</span>
          </div>
          {p.errorMessage ? <span className={s.formError} role="alert">⚠ {p.errorMessage}</span> : null}
          <Button label={p.addButton.label} variant="primary" isFullWidth isDisabled={p.addButton.isDisabled} onClick={p.addButton.onClick} />
        </>
      }
    >
      {p.imageUrl ? <img className={s.hero} src={p.imageUrl} alt="" /> : null}
      <div className={s.nameRow}>
        <VegMark isVeg={p.isVeg} label={p.vegLabel} />
        <span>{p.vegLabel}</span>
      </div>
      {p.description ? <p className={s.sheetDesc}>{p.description}</p> : null}

      {p.groups.map((g) => (
        <fieldset key={g.id} className={s.group}>
          <legend className={s.groupTitle}>{g.title}</legend>
          <p className={s.groupHint}>{g.hint}</p>
          {g.options.map((o) => (
            <label key={o.id} className={s.option}>
              <input type={g.control} name={g.id} checked={o.isSelected} disabled={o.isDisabled} onChange={o.onToggle} />
              <span className={s.optionLabel}>{o.label}{o.isDisabled && o.disabledLabel ? <span className={s.disabledNote}> · {o.disabledLabel}</span> : null}</span>
              {o.priceLabel ? <span className={s.optionPrice}>{o.priceLabel}</span> : null}
            </label>
          ))}
          {g.errorMessage ? <span className={s.groupError} role="alert">⚠ {g.errorMessage}</span> : null}
        </fieldset>
      ))}

      <TextField {...p.noteField} isMultiline />

      <div className={s.qtyRow}>
        <span className={s.qtyLabel}>{p.quantityLabel}</span>
        <QuantityStepper {...p.quantity} />
      </div>
    </Sheet>
  );
}
