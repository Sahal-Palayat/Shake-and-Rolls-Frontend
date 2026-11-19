import s from './common.module.css';
import { Button } from './Button';

export type FullPageMessageProps = { message: string; isLoading?: boolean; actionLabel?: string; onAction?: () => void };

export function FullPageMessage(p: FullPageMessageProps) {
  return (
    <main className={s.fullPage} aria-live="polite">
      {p.isLoading ? <div className={s.spinner} role="progressbar" aria-label="Loading" /> : null}
      <p>{p.message}</p>
      {p.actionLabel && p.onAction ? <Button label={p.actionLabel} onClick={p.onAction} variant="primary" /> : null}
    </main>
  );
}
