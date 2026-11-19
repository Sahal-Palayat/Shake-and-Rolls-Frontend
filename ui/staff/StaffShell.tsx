import type { ReactNode } from 'react';
import s from './staff.module.css';

export type StaffNavItemProps = { href: string; label: string; isActive: boolean };

export type StaffShellProps = {
  brandLabel: string;
  navItems: StaffNavItemProps[];
  userName: string;
  roleLabel: string;
  logoutLabel: string;
  onNavigate: (href: string) => void;
  onLogout: () => void;
  children: ReactNode;
};

export function StaffShell(p: StaffShellProps) {
  return (
    <div className={s.shell}>
      <header className={s.header}>
        <span className={s.brand}>{p.brandLabel}</span>
        <nav className={s.nav} aria-label="Staff">
          {p.navItems.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className={`${s.navLink} ${n.isActive ? s.navActive : ''}`}
              aria-current={n.isActive ? 'page' : undefined}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let "open in new tab" work
                e.preventDefault();
                p.onNavigate(n.href);
              }}
            >
              {n.label}
            </a>
          ))}
        </nav>
        <div className={s.user}>
          <span className={s.userText}>
            <strong>{p.userName}</strong>
            <span className={s.role}>{p.roleLabel}</span>
          </span>
          <button type="button" className={s.logout} onClick={p.onLogout}>{p.logoutLabel}</button>
        </div>
      </header>
      <main className={s.main}>{p.children}</main>
    </div>
  );
}
