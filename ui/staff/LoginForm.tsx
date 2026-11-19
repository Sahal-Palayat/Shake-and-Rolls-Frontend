import { Button } from '../common/Button';
import { Notice } from '../common/Notice';
import { TextField } from '../common/TextField';
import s from './staff.module.css';

export type LoginFormProps = {
  title: string;
  subtitle: string;
  username: string;
  secret: string;
  onUsernameChange: (v: string) => void;
  onSecretChange: (v: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitLabel: string;
  errorMessage?: string;
  onDismissError?: () => void;
};

export function LoginForm(p: LoginFormProps) {
  return (
    <main className={s.loginPage}>
      <form className={s.loginCard} onSubmit={(e) => { e.preventDefault(); p.onSubmit(); }} noValidate>
        <h1 className={s.loginTitle}>{p.title}</h1>
        <p className={s.loginSub}>{p.subtitle}</p>
        {p.errorMessage ? <Notice kind="error" text={p.errorMessage} onDismiss={p.onDismissError} /> : null}
        <TextField id="username" label="Username" value={p.username} onChange={p.onUsernameChange} autoComplete="username" isRequired />
        <TextField id="secret" label="Password or PIN" type="password" value={p.secret} onChange={p.onSecretChange} autoComplete="current-password" isRequired />
        <Button label={p.submitLabel} type="submit" variant="primary" isLoading={p.isSubmitting} isFullWidth />
      </form>
    </main>
  );
}
