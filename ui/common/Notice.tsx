import s from './common.module.css';

export type NoticeProps = { kind: 'error' | 'success' | 'info'; text: string; onDismiss?: () => void };

export function Notice(p: NoticeProps) {
  const icon = p.kind === 'error' ? '⚠' : p.kind === 'success' ? '✓' : 'ℹ';
  return (
    <div className={`${s.notice} ${p.kind === 'error' ? s.noticeError : ''}`} role={p.kind === 'error' ? 'alert' : 'status'}>
      <span><strong aria-hidden="true">{icon}</strong> {p.text}</span>
      {p.onDismiss ? <button type="button" className={s.noticeClose} onClick={p.onDismiss} aria-label="Dismiss">×</button> : null}
    </div>
  );
}
