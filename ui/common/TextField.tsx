import s from './common.module.css';

export type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'password' | 'number' | 'search' | 'date' | 'tel';
  inputMode?: 'text' | 'numeric' | 'decimal' | 'search';
  placeholder?: string;
  hint?: string;
  errorMessage?: string;
  autoComplete?: string;
  isDisabled?: boolean;
  isMultiline?: boolean;
  isRequired?: boolean;
  maxLength?: number;
};

export function TextField(p: TextFieldProps) {
  const common = {
    id: p.id,
    value: p.value,
    placeholder: p.placeholder,
    disabled: p.isDisabled,
    required: p.isRequired,
    maxLength: p.maxLength,
    className: `${s.field} ${p.errorMessage ? s.fieldError : ''}`,
    'aria-invalid': p.errorMessage ? true : undefined,
    'aria-describedby': p.errorMessage ? `${p.id}-err` : p.hint ? `${p.id}-hint` : undefined,
  };
  return (
    <div className={s.fieldWrap}>
      <label htmlFor={p.id} className={s.label}>{p.label}</label>
      {p.isMultiline ? (
        <textarea {...common} onChange={(e) => p.onChange(e.target.value)} />
      ) : (
        <input {...common} type={p.type ?? 'text'} inputMode={p.inputMode} autoComplete={p.autoComplete} onChange={(e) => p.onChange(e.target.value)} />
      )}
      {p.errorMessage ? <span id={`${p.id}-err`} className={s.error} role="alert">⚠ {p.errorMessage}</span> : p.hint ? <span id={`${p.id}-hint`} className={s.hint}>{p.hint}</span> : null}
    </div>
  );
}
