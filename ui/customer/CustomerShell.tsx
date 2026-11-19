import type { ReactNode } from 'react';
import s from './customer.module.css';

export type CustomerNavItemProps = { href: string; label: string; isActive: boolean };

export type CustomerShellProps = {
  brandLabel: string;
  brandHref: string;
  tagline: string;
  navItems: CustomerNavItemProps[];
  /** Present only when someone is signed in. */
  signOut?: { label: string; onClick: () => void };
  onNavigate: (href: string) => void;
  children: ReactNode;
};

const plainClick = (e: React.MouseEvent) => !(e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0); // let "open in new tab" work

export function CustomerShell(p: CustomerShellProps) {
  const go = (href: string) => (e: React.MouseEvent) => {
    if (!plainClick(e)) return;
    e.preventDefault();
    p.onNavigate(href);
  };
  return (
    <div className={s.root}>
      <header className={s.header}>
        <div className={s.headerInner}>
          <div className={s.brandBlock}>
            <a href={p.brandHref} className={s.brand} onClick={go(p.brandHref)}>{p.brandLabel}</a>
            <span className={s.tagline}>{p.tagline}</span>
          </div>
          <div className={s.right}>
            <nav className={s.nav} aria-label="Main">
              {p.navItems.map((n) => (
                <a key={n.href} href={n.href} className={`${s.navLink} ${n.isActive ? s.navActive : ''}`} aria-current={n.isActive ? 'page' : undefined} onClick={go(n.href)}>
                  {n.label}
                </a>
              ))}
            </nav>
            {p.signOut ? <button type="button" className={s.signOut} onClick={p.signOut.onClick}>{p.signOut.label}</button> : null}
          </div>
        </div>
      </header>
      <main className={s.main}>{p.children}</main>
    </div>
  );
}
