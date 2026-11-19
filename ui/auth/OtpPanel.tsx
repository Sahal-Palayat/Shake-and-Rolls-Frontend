import { Button } from '../common/Button';
import { TextField, type TextFieldProps } from '../common/TextField';
import s from './auth.module.css';

export type OtpPanelProps = {
  title: string;
  description: string;
  phase: 'phone' | 'code';
  phoneField: TextFieldProps;
  codeField: TextFieldProps;
  primaryAction: { label: string; onClick: () => void; isLoading: boolean; isDisabled: boolean };
  /** "Change number" / "Send a new code". Absent when nothing sensible to offer. */
  secondaryAction?: { label: string; onClick: () => void; isDisabled: boolean };
  errorMessage?: string;
  infoMessage?: string;
};

/** Phone number in, then the 6-digit code. Same panel wherever a customer has to prove their number. */
export function OtpPanel(p: OtpPanelProps) {
  return (
    <section className={s.panel} aria-labelledby="otp-title">
      <h2 id="otp-title" className={s.title}>{p.title}</h2>
      <p className={s.text}>{p.description}</p>
      <TextField {...p.phoneField} />
      {p.phase === 'code' ? <TextField {...p.codeField} /> : null}
      {p.infoMessage ? <span className={s.info} role="status">{p.infoMessage}</span> : null}
      {p.errorMessage ? <span className={s.error} role="alert">⚠ {p.errorMessage}</span> : null}
      <div className={s.actions}>
        <Button label={p.primaryAction.label} variant="primary" onClick={p.primaryAction.onClick} isLoading={p.primaryAction.isLoading} isDisabled={p.primaryAction.isDisabled} />
        {p.secondaryAction ? <Button label={p.secondaryAction.label} variant="ghost" onClick={p.secondaryAction.onClick} isDisabled={p.secondaryAction.isDisabled} /> : null}
      </div>
    </section>
  );
}
