import s from './common.module.css';

export type SelectFieldProps = {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  isDisabled?: boolean;
  errorMessage?: string;
};

export function SelectField(p: SelectFieldProps) {
  return (
    <div className={s.fieldWrap}>
      <label htmlFor={p.id} className={s.label}>{p.label}</label>
      <select id={p.id} className={`${s.field} ${p.errorMessage ? s.fieldError : ''}`} value={p.value} disabled={p.isDisabled} onChange={(e) => p.onChange(e.target.value)}>
        {p.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {p.errorMessage ? <span className={s.error} role="alert">⚠ {p.errorMessage}</span> : null}
    </div>
  );
}
