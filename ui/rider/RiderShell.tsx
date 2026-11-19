import type { ReactNode } from 'react';
import { Notice, type NoticeProps } from '../common/Notice';
import s from './rider.module.css';

export type RiderShellProps = {
  /** false until the session is checked, and while a signed-out visitor is being sent to sign-in. */
  isAllowed: boolean;
  loadingLabel: string;
  brand: string;
  roleLabel: string;
  riderName: string;
  logoutLabel: string;
  onLogout: () => void;
  availability?: { isOnline: boolean; isBusy: boolean; label: string; hint: string; switchLabel: string; onToggle: () => void };
  notice?: NoticeProps;
  children: ReactNode;
};

export function RiderShell(p: RiderShellProps) {
  if (!p.isAllowed) {
    return (
      <div className={s.shell}>
        <p className={s.center} role="status">{p.loadingLabel}</p>
      </div>
    );
  }
  const a = p.availability;
  return (
    <div className={s.shell}>
      <header className={s.header}>
        <div className={s.headRow}>
          <span>
            <span className={s.brand}>{p.brand}</span>
            <span className={s.role}>{p.roleLabel}</span>
          </span>
          <span className={s.who}>
            {p.riderName}
            <button type="button" className={s.link} onClick={p.onLogout}>{p.logoutLabel}</button>
          </span>
        </div>
        {a ? (
          <div className={s.avail}>
            <span className={s.availText}>
              <span className={s.availLabel}>{a.label}</span>
              <span className={s.availHint}>{a.hint}</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={a.isOnline}
              aria-label={a.switchLabel}
              className={`${s.switch} ${a.isOnline ? s.switchOn : ''}`}
              disabled={a.isBusy}
              onClick={a.onToggle}
            >
              {a.isOnline ? 'ON' : 'OFF'}
            </button>
          </div>
        ) : null}
      </header>
      <main className={s.main}>
        {p.notice ? <Notice {...p.notice} /> : null}
        {p.children}
      </main>
    </div>
  );
}
