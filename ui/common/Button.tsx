import type { ReactNode } from 'react';
import s from './common.module.css';

export type ButtonProps = {
  label: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'md' | 'sm';
  type?: 'button' | 'submit';
  isDisabled?: boolean;
  isLoading?: boolean;
  isFullWidth?: boolean;
  ariaLabel?: string;
};

export function Button(p: ButtonProps) {
  const cls = [s.btn, s[p.variant ?? 'ghost'], p.size === 'sm' ? s.sm : '', p.isFullWidth ? s.full : ''].join(' ');
  return (
    <button type={p.type ?? 'button'} className={cls} onClick={p.onClick} disabled={p.isDisabled || p.isLoading} aria-busy={p.isLoading || undefined} aria-label={p.ariaLabel}>
      {p.isLoading ? 'Please wait…' : p.label}
    </button>
  );
}
