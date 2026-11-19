import { Button } from '../common/Button';
import { ConfirmDialog, type ConfirmDialogProps } from '../common/ConfirmDialog';
import { Notice, type NoticeProps } from '../common/Notice';
import { SelectField } from '../common/SelectField';
import { Toggle } from '../common/Toggle';
import { CategoryFormDialog, type CategoryFormDialogProps } from './CategoryFormDialog';
import { ItemFormDialog, type ItemFormDialogProps } from './ItemFormDialog';
import s from './menu-admin.module.css';

export type CategoryRowProps = { id: string; name: string; subtitle: string; onEdit: () => void; onDelete: () => void };
export type ItemRowProps = {
  id: string;
  name: string;
  categoryName: string;
  priceLabel: string;
  isVeg: boolean;
  vegLabel: string;
  imageUrl?: string;
  isAvailable: boolean;
  isBusy: boolean;
  onToggleAvailable: (next: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
};

export type MenuAdminViewProps = {
  title: string;
  isLoading: boolean;
  notice?: NoticeProps;
  categories: CategoryRowProps[];
  items: ItemRowProps[];
  emptyItemsText: string;
  categoryFilter: { value: string; options: { value: string; label: string }[]; onChange: (v: string) => void };
  onAddCategory: () => void;
  onAddItem: () => void;
  itemForm?: ItemFormDialogProps;
  categoryForm?: CategoryFormDialogProps;
  confirm?: ConfirmDialogProps;
};

export function MenuAdminView(p: MenuAdminViewProps) {
  return (
    <div className={s.page}>
      <div className={s.top}>
        <h1 className={s.h1}>{p.title}</h1>
        <div className={s.actions}>
          <Button label="+ Category" onClick={p.onAddCategory} />
          <Button label="+ Menu item" variant="primary" onClick={p.onAddItem} />
        </div>
      </div>
      {p.notice ? <Notice {...p.notice} /> : null}
      {p.isLoading ? <p>Loading…</p> : (
        <div className={s.layout}>
          <section className={s.panel} aria-label="Categories">
            <h2 className={s.h2}>Categories</h2>
            <ul className={s.list}>
              {p.categories.map((c) => (
                <li key={c.id} className={s.catRow}>
                  <span><span className={s.catName}>{c.name}</span><br /><span className={s.muted}>{c.subtitle}</span></span>
                  <span className={s.rowBtns}>
                    <Button label="Edit" size="sm" onClick={c.onEdit} ariaLabel={`Edit category ${c.name}`} />
                    <Button label="Delete" size="sm" variant="danger" onClick={c.onDelete} ariaLabel={`Delete category ${c.name}`} />
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className={s.panel} aria-label="Items">
            <div className={s.top}>
              <h2 className={s.h2}>Items</h2>
              <SelectField id="cat-filter" label="Show" value={p.categoryFilter.value} options={p.categoryFilter.options} onChange={p.categoryFilter.onChange} />
            </div>
            {p.items.length === 0 ? <p className={s.muted}>{p.emptyItemsText}</p> : (
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead><tr><th scope="col">Image</th><th scope="col">Item</th><th scope="col">Price</th><th scope="col">Stock</th><th scope="col">Actions</th></tr></thead>
                  <tbody>
                    {p.items.map((i) => (
                      <tr key={i.id}>
                        <td>{i.imageUrl ? <img className={s.thumb} src={i.imageUrl} alt="" /> : <div className={s.noThumb}>No image</div>}</td>
                        <td><span className={s.itemName}>{i.name}</span><br /><span className={s.muted}>{i.categoryName}</span> · <span className={s.vegMark}><span aria-hidden="true">{i.isVeg ? '🟢' : '🔴'}</span>{i.vegLabel}</span></td>
                        <td><strong>{i.priceLabel}</strong></td>
                        <td><Toggle label={`${i.name} available`} isOn={i.isAvailable} onToggle={i.onToggleAvailable} isDisabled={i.isBusy} onText="Available" offText="Sold out" /></td>
                        <td><span className={s.rowBtns}>
                          <Button label="Edit" size="sm" onClick={i.onEdit} ariaLabel={`Edit ${i.name}`} />
                          <Button label="Delete" size="sm" variant="danger" onClick={i.onDelete} ariaLabel={`Delete ${i.name}`} />
                        </span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
      {p.itemForm ? <ItemFormDialog {...p.itemForm} /> : null}
      {p.categoryForm ? <CategoryFormDialog {...p.categoryForm} /> : null}
      {p.confirm ? <ConfirmDialog {...p.confirm} /> : null}
    </div>
  );
}
