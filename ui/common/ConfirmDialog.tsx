import { Button } from './Button';
import s from './common.module.css';
import { Dialog } from './Dialog';

export type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  isBusy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog(p: ConfirmDialogProps) {
  return (
    <Dialog
      title={p.title}
      onClose={p.onCancel}
      actions={
        <>
          <Button label={p.cancelLabel} onClick={p.onCancel} isDisabled={p.isBusy} />
          <Button label={p.confirmLabel} variant="secondary" onClick={p.onConfirm} isLoading={p.isBusy} />
        </>
      }
    >
      <p className={s.dialogText}>{p.message}</p>
    </Dialog>
  );
}
