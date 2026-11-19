'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import s from './common.module.css';

export type SheetProps = {
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** 'right' docks to the right edge on wide screens (cart). Default: centred (item options). */
  placement?: 'center' | 'right';
};

/**
 * Bottom sheet on phones, dialog or side panel on wide screens.
 * The effect below is purely presentational: lock page scroll while open, move focus in, put it back on close.
 */
export function Sheet(p: SheetProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      before?.focus?.();
    };
  }, []);
  const right = p.placement === 'right';
  return (
    <div className={`${s.sheetOverlay} ${right ? s.sheetOverlayRight : ''}`} onMouseDown={(e) => { if (e.target === e.currentTarget) p.onClose(); }}>
      <div ref={ref} tabIndex={-1} className={`${s.sheet} ${right ? s.sheetRight : ''}`} role="dialog" aria-modal="true" aria-label={p.title} onKeyDown={(e) => { if (e.key === 'Escape') p.onClose(); }}>
        <div className={s.sheetHead}>
          <h2 className={s.sheetTitle}>{p.title}</h2>
          <button type="button" className={s.sheetClose} onClick={p.onClose} aria-label={p.closeLabel}>×</button>
        </div>
        <div className={s.sheetBody}>{p.children}</div>
        {p.footer ? <div className={s.sheetFoot}>{p.footer}</div> : null}
      </div>
    </div>
  );
}
