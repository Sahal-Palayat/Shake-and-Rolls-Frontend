import type { ReactNode } from 'react';
import { Button } from '../common/Button';
import { Notice, type NoticeProps } from '../common/Notice';
import { Toggle, type ToggleProps } from '../common/Toggle';
import { CartBar, type CartBarProps } from '../cart/CartBar';
import { MenuItemCard, type MenuItemCardProps } from './MenuItemCard';
import s from './menu.module.css';

export type MenuTabProps = { id: string; domId: string; label: string; isActive: boolean; onSelect: () => void };
export type MenuSectionProps = { id: string; domId: string; title: string; description?: string; items: MenuItemCardProps[] };

export type MenuScreenProps = {
  search: { value: string; label: string; placeholder: string; onChange: (v: string) => void };
  vegFilter: ToggleProps;
  tabs: MenuTabProps[];
  tabsLabel: string;
  sections: MenuSectionProps[];
  isLoading: boolean;
  loadingLabel: string;
  /** Shown instead of the list: load failed, or nothing matches the filters. */
  message?: { text: string; actionLabel?: string; onAction?: () => void };
  notice?: NoticeProps;
  cartBar?: CartBarProps;
  /** Overlays (item options sheet, cart drawer). Rendered by the feature when open. */
  overlays?: ReactNode;
};

export function MenuScreen(p: MenuScreenProps) {
  return (
    <div className={`${s.screen} ${p.cartBar ? s.hasCartBar : ''}`}>
      <div className={s.controls}>
        <div className={s.controlsInner}>
          <div className={s.searchRow}>
            <div className={s.searchBox}>
              <label className="sr-only" htmlFor="menu-search">{p.search.label}</label>
              <input id="menu-search" type="search" className={s.search} value={p.search.value} placeholder={p.search.placeholder} onChange={(e) => p.search.onChange(e.target.value)} autoComplete="off" />
            </div>
            <Toggle {...p.vegFilter} />
          </div>
          {p.tabs.length ? (
            <nav className={s.tabs} aria-label={p.tabsLabel}>
              {p.tabs.map((t) => (
                <button key={t.id} id={t.domId} type="button" className={`${s.tab} ${t.isActive ? s.tabActive : ''}`} aria-current={t.isActive ? 'true' : undefined} onClick={t.onSelect}>
                  {t.label}
                </button>
              ))}
            </nav>
          ) : null}
        </div>
      </div>

      {p.notice ? <div className={s.noticeWrap}><Notice {...p.notice} /></div> : null}

      {p.isLoading ? (
        <ul className={s.skeletonList} aria-busy="true" aria-label={p.loadingLabel}>
          {[0, 1, 2, 3].map((i) => <li key={i} className={s.skeleton} />)}
        </ul>
      ) : p.message ? (
        <div className={s.state} role="status">
          <p className={s.stateText}>{p.message.text}</p>
          {p.message.actionLabel && p.message.onAction ? <Button label={p.message.actionLabel} onClick={p.message.onAction} variant="primary" /> : null}
        </div>
      ) : (
        <div className={s.content}>
          {p.sections.map((sec) => (
            <section key={sec.id} id={sec.domId} className={s.section} aria-labelledby={`${sec.domId}-h`}>
              <h2 id={`${sec.domId}-h`} className={s.sectionTitle}>{sec.title}</h2>
              {sec.description ? <p className={s.sectionDesc}>{sec.description}</p> : null}
              <ul className={s.cards}>
                {sec.items.map((i) => <MenuItemCard key={i.id} {...i} />)}
              </ul>
            </section>
          ))}
        </div>
      )}

      {p.cartBar ? <CartBar {...p.cartBar} /> : null}
      {p.overlays}
    </div>
  );
}
