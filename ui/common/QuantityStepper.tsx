import s from './common.module.css';

export type QuantityStepperProps = {
  label: string; // accessible name, e.g. "Quantity of Paneer Wrap"
  valueLabel: string; // already formatted, e.g. "2"
  decreaseLabel: string;
  increaseLabel: string;
  isDecreaseDisabled?: boolean;
  isIncreaseDisabled?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  size?: 'md' | 'sm';
};

export function QuantityStepper(p: QuantityStepperProps) {
  return (
    <div className={`${s.stepper} ${p.size === 'sm' ? s.stepSm : ''}`} role="group" aria-label={p.label}>
      <button type="button" className={s.stepBtn} onClick={p.onDecrease} disabled={p.isDecreaseDisabled} aria-label={p.decreaseLabel}>−</button>
      <span className={s.stepVal} aria-live="polite">{p.valueLabel}</span>
      <button type="button" className={s.stepBtn} onClick={p.onIncrease} disabled={p.isIncreaseDisabled} aria-label={p.increaseLabel}>+</button>
    </div>
  );
}
