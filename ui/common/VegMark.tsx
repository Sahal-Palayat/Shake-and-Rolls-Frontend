import s from './common.module.css';

export type VegMarkProps = { isVeg: boolean; label: string }; // label: "Veg" / "Non-veg", read by screen readers

/** The shape differs (dot vs triangle) so it never relies on colour alone. */
export function VegMark(p: VegMarkProps) {
  return <span className={`${s.vegMark} ${p.isVeg ? '' : s.nonVegMark}`} role="img" aria-label={p.label} />;
}
