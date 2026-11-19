import { Button } from '../common/Button';
import { Dialog } from '../common/Dialog';
import { Notice } from '../common/Notice';
import { SelectField } from '../common/SelectField';
import { TextField } from '../common/TextField';
import { Toggle } from '../common/Toggle';
import s from './menu-admin.module.css';

export type ItemFormValues = {
  name: string;
  description: string;
  price: string; // rupees, as typed
  categoryId: string;
  isVeg: boolean;
  isAvailable: boolean;
  sortOrder: string;
  imageUrl: string;
};

export type ItemFormDialogProps = {
  title: string;
  values: ItemFormValues;
  errors: Partial<Record<keyof ItemFormValues, string>>;
  categoryOptions: { value: string; label: string }[];
  formErrorMessage?: string;
  isSaving: boolean;
  isUploading: boolean;
  saveLabel: string;
  onChange: <K extends keyof ItemFormValues>(field: K, value: ItemFormValues[K]) => void;
  onPickImage: (file: File | undefined) => void;
  onRemoveImage: () => void;
  onSave: () => void;
  onCancel: () => void;
};

export function ItemFormDialog(p: ItemFormDialogProps) {
  const v = p.values;
  return (
    <Dialog
      title={p.title}
      onClose={p.onCancel}
      isWide
      actions={
        <>
          <Button label="Cancel" onClick={p.onCancel} isDisabled={p.isSaving} />
          <Button label={p.saveLabel} variant="primary" onClick={p.onSave} isLoading={p.isSaving} isDisabled={p.isUploading} />
        </>
      }
    >
      <form className={s.form} onSubmit={(e) => { e.preventDefault(); p.onSave(); }} noValidate>
        {p.formErrorMessage ? <Notice kind="error" text={p.formErrorMessage} /> : null}
        <TextField id="item-name" label="Name" value={v.name} onChange={(x) => p.onChange('name', x)} errorMessage={p.errors.name} maxLength={120} isRequired />
        <TextField id="item-desc" label="Description" value={v.description} onChange={(x) => p.onChange('description', x)} errorMessage={p.errors.description} isMultiline maxLength={500} />
        <div className={s.two}>
          <TextField id="item-price" label="Price (₹)" value={v.price} onChange={(x) => p.onChange('price', x)} inputMode="decimal" errorMessage={p.errors.price} hint="e.g. 149 or 149.50" isRequired />
          <SelectField id="item-cat" label="Category" value={v.categoryId} options={p.categoryOptions} onChange={(x) => p.onChange('categoryId', x)} errorMessage={p.errors.categoryId} />
        </div>
        <div className={s.two}>
          <TextField id="item-sort" label="Sort order" value={v.sortOrder} onChange={(x) => p.onChange('sortOrder', x)} inputMode="numeric" errorMessage={p.errors.sortOrder} hint="Lower shows first" />
          <div>
            <Toggle label="Vegetarian" isOn={v.isVeg} onToggle={(x) => p.onChange('isVeg', x)} onText="Veg" offText="Non-veg" />
            <Toggle label="Available" isOn={v.isAvailable} onToggle={(x) => p.onChange('isAvailable', x)} onText="Available" offText="Sold out" />
          </div>
        </div>
        <div className={s.imageRow}>
          {v.imageUrl ? <img className={s.preview} src={v.imageUrl} alt="Item preview" /> : null}
          <div>
            <label htmlFor="item-image" className={s.muted}>Image (JPEG, PNG or WebP, max 2 MB)</label>
            <br />
            <input id="item-image" className={s.fileInput} type="file" accept="image/jpeg,image/png,image/webp" disabled={p.isUploading} onChange={(e) => { p.onPickImage(e.target.files?.[0]); e.target.value = ''; }} />
            {p.isUploading ? <p className={s.muted}>Uploading…</p> : null}
            {p.errors.imageUrl ? <p role="alert"><strong>⚠ {p.errors.imageUrl}</strong></p> : null}
            {v.imageUrl ? <Button label="Remove image" size="sm" variant="danger" onClick={p.onRemoveImage} /> : null}
          </div>
        </div>
      </form>
    </Dialog>
  );
}
