import s from './common.module.css';

export type StatusTone = 'new' | 'preparing' | 'ready' | 'delayed' | 'closed';
export type StatusBadgeProps = { label: string; tone: StatusTone };

/** Colour is never the only signal: every tone has its own glyph plus the text label. */
const GLYPH: Record<StatusTone, string> = { new: '●', preparing: '◐', ready: '✓', delayed: '⚠', closed: '–' };

export function StatusBadge(p: StatusBadgeProps) {
  return (
    <span className={`${s.badge} ${s[`tone_${p.tone}`]}`}>
      <span aria-hidden="true">{GLYPH[p.tone]}</span>
      {p.label}
    </span>
  );
}
