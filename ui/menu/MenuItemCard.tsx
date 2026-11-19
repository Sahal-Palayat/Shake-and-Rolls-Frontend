import { VegMark } from '../common/VegMark';
import s from './menu.module.css';

export type MenuItemCardProps = {
  id: string;
  name: string;
  description: string;
  priceLabel: string; // already formatted, e.g. "₹149"
  imageUrl?: string;
  imageFallback: string; // one letter shown when there is no picture
  isVeg: boolean;
  vegLabel: string; // "Veg" | "Non-veg"
  isAvailable: boolean;
  soldOutLabel: string;
  inCartLabel?: string; // e.g. "2 in cart"
  addLabel: string; // "Add" or "Customise"
  addAriaLabel: string; // "Add Paneer Wrap" etc
  onOpen: () => void; // open the details / options sheet
  onAdd: () => void; // quick add, or open the sheet when the item has options (the feature decides)
};

export function MenuItemCard(p: MenuItemCardProps) {
  return (
    <li className={`${s.card} ${p.isAvailable ? '' : s.unavailable}`}>
      <button type="button" className={s.cardBody} onClick={p.onOpen} disabled={!p.isAvailable} aria-label={p.isAvailable ? undefined : `${p.name}, ${p.soldOutLabel}`}>
        <span className={s.nameRow}>
          <VegMark isVeg={p.isVeg} label={p.vegLabel} />
          <span className={s.name}>{p.name}</span>
        </span>
        {p.description ? <span className={s.desc}>{p.description}</span> : null}
        <span className={s.priceRow}>
          <span className={s.price}>{p.priceLabel}</span>
          {!p.isAvailable ? <span className={s.soldBadge}>{p.soldOutLabel}</span> : p.inCartLabel ? <span className={s.inCart}>{p.inCartLabel}</span> : null}
        </span>
      </button>
      <div className={s.media}>
        {p.imageUrl ? <img className={s.img} src={p.imageUrl} alt="" loading="lazy" /> : <span className={s.imgBlank} aria-hidden="true">{p.imageFallback}</span>}
        <span className={s.addWrap}>
          <button type="button" className={s.add} onClick={p.onAdd} disabled={!p.isAvailable} aria-label={p.addAriaLabel}>{p.isAvailable ? p.addLabel : p.soldOutLabel}</button>
        </span>
      </div>
    </li>
  );
}
