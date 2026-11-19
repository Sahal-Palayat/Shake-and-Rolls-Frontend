import s from './common.module.css';

export type ToggleProps = {
  label: string;
  isOn: boolean;
  onToggle: (next: boolean) => void;
  isDisabled?: boolean;
  onText?: string;
  offText?: string;
};

export function Toggle(p: ToggleProps) {
  return (
    <button type="button" role="switch" aria-checked={p.isOn} aria-label={p.label} disabled={p.isDisabled} className={`${s.toggle} ${p.isOn ? s.on : ''}`} onClick={() => p.onToggle(!p.isOn)}>
      <span className={s.track} aria-hidden="true"><span className={s.thumb} /></span>
      <span>{p.isOn ? (p.onText ?? 'On') : (p.offText ?? 'Off')}</span>
    </button>
  );
}
