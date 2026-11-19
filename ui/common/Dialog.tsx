import type { ReactNode } from 'react';
import s from './common.module.css';

export type DialogProps = { title: string; onClose: () => void; children: ReactNode; actions?: ReactNode; isWide?: boolean };

export function Dialog(p: DialogProps) {
  return (
    <div className={s.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) p.onClose(); }}>
      <div className={`${s.dialog} ${p.isWide ? s.dialogWide : ''}`} role="dialog" aria-modal="true" aria-label={p.title} onKeyDown={(e) => { if (e.key === 'Escape') p.onClose(); }}>
        <h2 className={s.dialogTitle}>{p.title}</h2>
        {p.children}
        {p.actions ? <div className={s.dialogActions}>{p.actions}</div> : null}
      </div>
    </div>
  );
}
