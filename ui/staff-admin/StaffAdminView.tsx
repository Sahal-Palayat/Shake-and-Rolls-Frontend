import { Button } from '../common/Button';
import { Dialog } from '../common/Dialog';
import { Notice, type NoticeProps } from '../common/Notice';
import { SelectField } from '../common/SelectField';
import { StatusBadge } from '../common/StatusBadge';
import { TextField } from '../common/TextField';
import { Toggle } from '../common/Toggle';
import s from '../orders-admin/orders-admin.module.css';

export type StaffRowProps = { id: string; name: string; username: string; roleLabel: string; isActive: boolean; isSelf: boolean; isBusy: boolean; onToggle: (next: boolean) => void };

export type StaffFormValues = { name: string; username: string; role: string; secretType: string; secret: string };

export type StaffFormProps = {
  values: StaffFormValues;
  errors: Partial<Record<keyof StaffFormValues, string>>;
  formErrorMessage?: string;
  roleOptions: { value: string; label: string }[];
  secretTypeOptions: { value: string; label: string }[];
  secretHint: string;
  isSaving: boolean;
  onChange: (field: keyof StaffFormValues, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export type StaffAdminViewProps = {
  title: string;
  notice?: NoticeProps;
  isLoading: boolean;
  rows: StaffRowProps[];
  emptyText: string;
  onAdd: () => void;
  form?: StaffFormProps;
};

export function StaffAdminView(p: StaffAdminViewProps) {
  return (
    <div className={s.page}>
      <div className={s.top}>
        <h1 className={s.h1}>{p.title}</h1>
        <Button label="+ New account" variant="primary" onClick={p.onAdd} />
      </div>
      {p.notice ? <Notice {...p.notice} /> : null}
      <div className={s.tableWrap}>
        {p.isLoading ? <p className={s.empty}>Loading…</p> : p.rows.length === 0 ? <p className={s.empty}>{p.emptyText}</p> : (
          <table className={s.table}>
            <thead><tr><th scope="col">Name</th><th scope="col">Username</th><th scope="col">Role</th><th scope="col">Access</th></tr></thead>
            <tbody>
              {p.rows.map((r) => (
                <tr key={r.id}>
                  <td><strong>{r.name}</strong>{r.isSelf ? <span className={s.muted}> (you)</span> : null}</td>
                  <td>{r.username}</td>
                  <td><StatusBadge label={r.roleLabel} tone="closed" /></td>
                  <td><Toggle label={`${r.name} enabled`} isOn={r.isActive} onToggle={r.onToggle} isDisabled={r.isBusy || r.isSelf} onText="Enabled" offText="Disabled" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {p.form ? (
        <Dialog title="New account" onClose={p.form.onCancel} actions={<><Button label="Cancel" onClick={p.form.onCancel} isDisabled={p.form.isSaving} /><Button label="Create account" variant="primary" onClick={p.form.onSave} isLoading={p.form.isSaving} /></>}>
          <form className={s.staffForm} onSubmit={(e) => { e.preventDefault(); p.form?.onSave(); }} noValidate>
            {p.form.formErrorMessage ? <Notice kind="error" text={p.form.formErrorMessage} /> : null}
            <TextField id="st-name" label="Name" value={p.form.values.name} onChange={(v) => p.form?.onChange('name', v)} errorMessage={p.form.errors.name} maxLength={80} isRequired />
            <TextField id="st-user" label="Username" value={p.form.values.username} onChange={(v) => p.form?.onChange('username', v)} errorMessage={p.form.errors.username} hint="3 to 32 letters, digits, . _ -" autoComplete="off" isRequired />
            <SelectField id="st-role" label="Role" value={p.form.values.role} options={p.form.roleOptions} onChange={(v) => p.form?.onChange('role', v)} />
            <SelectField id="st-type" label="Sign-in type" value={p.form.values.secretType} options={p.form.secretTypeOptions} onChange={(v) => p.form?.onChange('secretType', v)} />
            <TextField id="st-secret" label="Password or PIN" type="password" value={p.form.values.secret} onChange={(v) => p.form?.onChange('secret', v)} errorMessage={p.form.errors.secret} hint={p.form.secretHint} autoComplete="new-password" isRequired />
          </form>
        </Dialog>
      ) : null}
    </div>
  );
}
