import s from '../menu/menu.module.css';

export type CartBarProps = {
  countLabel: string; // "2 items"
  totalLabel?: string; // server-confirmed, e.g. "₹298". Absent while it is being priced.
  actionLabel: string; // "View cart"
  isUpdating: boolean;
  onClick: () => void;
};

export function CartBar(p: CartBarProps) {
  return (
    <div className={s.cartBar}>
      <button type="button" className={`${s.cartBarBtn} ${p.isUpdating ? s.updating : ''}`} onClick={p.onClick} aria-busy={p.isUpdating || undefined}>
        <span>{p.countLabel}{p.totalLabel ? ` · ${p.totalLabel}` : ''}</span>
        <span>{p.actionLabel}</span>
      </button>
    </div>
  );
}
