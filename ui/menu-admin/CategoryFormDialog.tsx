import { Button } from '../common/Button';
import { Dialog } from '../common/Dialog';
import { Notice } from '../common/Notice';
import { TextField } from '../common/TextField';
import s from './menu-admin.module.css';

export type CategoryFormValues = { name: string; description: string; sortOrder: string };

export type CategoryFormDialogProps = {
  title: string;
  values: CategoryFormValues;
  errors: Partial<Record<keyof CategoryFormValues, string>>;
  formErrorMessage?: string;
  isSaving: boolean;
  saveLabel: string;
  onChange: (field: keyof CategoryFormValues, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function CategoryFormDialog(p: CategoryFormDialogProps) {
  return (
    <Dialog
      title={p.title}
      onClose={p.onCancel}
      actions={
        <>
          <Button label="Cancel" onClick={p.onCancel} isDisabled={p.isSaving} />
          <Button label={p.saveLabel} variant="primary" onClick={p.onSave} isLoading={p.isSaving} />
        </>
      }
    >
      <form className={s.form} onSubmit={(e) => { e.preventDefault(); p.onSave(); }} noValidate>
        {p.formErrorMessage ? <Notice kind="error" text={p.formErrorMessage} /> : null}
        <TextField id="cat-name" label="Name" value={p.values.name} onChange={(x) => p.onChange('name', x)} errorMessage={p.errors.name} maxLength={60} isRequired />
        <TextField id="cat-desc" label="Description" value={p.values.description} onChange={(x) => p.onChange('description', x)} errorMessage={p.errors.description} maxLength={300} />
        <TextField id="cat-sort" label="Sort order" value={p.values.sortOrder} onChange={(x) => p.onChange('sortOrder', x)} inputMode="numeric" errorMessage={p.errors.sortOrder} hint="Lower shows first" />
      </form>
    </Dialog>
  );
}
