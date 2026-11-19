import { Button } from '../common/Button';
import { TextField } from '../common/TextField';
import { Toggle } from '../common/Toggle';
import s from './kitchen.module.css';

export type AvailabilityRowProps = { id: string; name: string; categoryName: string; isAvailable: boolean; isBusy: boolean; onToggle: (next: boolean) => void };

export type AvailabilityPanelProps = {
  title: string;
  isLoading: boolean;
  search: string;
  onSearch: (v: string) => void;
  rows: AvailabilityRowProps[];
  emptyText: string;
  closeLabel: string;
  onClose: () => void;
};

export function AvailabilityPanel(p: AvailabilityPanelProps) {
  return (
    <div className={s.panelOverlay} onMouseDown={(e) => { if (e.target === e.currentTarget) p.onClose(); }}>
      <aside className={s.panel} role="dialog" aria-modal="true" aria-label={p.title} onKeyDown={(e) => { if (e.key === 'Escape') p.onClose(); }}>
        <div className={s.top}>
          <h2 className={s.h1}>{p.title}</h2>
          <Button label={p.closeLabel} onClick={p.onClose} />
        </div>
        <TextField id="av-search" type="search" label="Find item" value={p.search} onChange={p.onSearch} />
        {p.isLoading ? <p>Loading…</p> : p.rows.length === 0 ? <p className={s.muted}>{p.emptyText}</p> : (
          <ul className={s.panelList}>
            {p.rows.map((r) => (
              <li key={r.id} className={`${s.avRow} ${r.isAvailable ? '' : s.avOff}`}>
                <span><span className={s.avName}>{r.name}</span><br /><span className={s.muted}>{r.categoryName}</span></span>
                <Toggle label={`${r.name} available`} isOn={r.isAvailable} onToggle={r.onToggle} isDisabled={r.isBusy} onText="In stock" offText="Sold out" />
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
