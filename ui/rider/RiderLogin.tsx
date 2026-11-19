import { TextField, type TextFieldProps } from '../common/TextField';
import s from './rider.module.css';

export type RiderLoginProps = {
  title: string;
  description: string;
  usernameField: TextFieldProps;
  secretField: TextFieldProps;
  submitLabel: string;
  isBusy: boolean;
  onSubmit: () => void;
  errorMessage?: string;
};

export function RiderLogin(p: RiderLoginProps) {
  return (
    <div className={s.loginWrap}>
      <form
        className={s.loginCard}
        aria-labelledby="rider-login-title"
        onSubmit={(e) => {
          e.preventDefault();
          p.onSubmit();
        }}
      >
        <h1 id="rider-login-title" className={s.loginTitle}>{p.title}</h1>
        <p className={s.muted}>{p.description}</p>
        <TextField {...p.usernameField} />
        <TextField {...p.secretField} />
        {p.errorMessage ? <div className={s.error} role="alert">⚠ {p.errorMessage}</div> : null}
        <button type="submit" className={s.submit} disabled={p.isBusy}>{p.submitLabel}</button>
      </form>
    </div>
  );
}
