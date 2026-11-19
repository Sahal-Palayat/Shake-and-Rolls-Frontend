import { Button } from '../common/Button';
import { Dialog } from '../common/Dialog';
import { Notice, type NoticeProps } from '../common/Notice';
import { TextField } from '../common/TextField';
import { AvailabilityPanel, type AvailabilityPanelProps } from './AvailabilityPanel';
import { OrderCard, type OrderCardProps } from './OrderCard';
import s from './kitchen.module.css';

export type KitchenColumnProps = { id: string; title: string; count: number; emptyText: string; cards: OrderCardProps[] };

export type RejectDialogProps = {
  title: string;
  orderLabel: string;
  reason: string;
  errorMessage?: string;
  isBusy: boolean;
  onReasonChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export type KitchenBoardProps = {
  title: string;
  connection: { label: string; isLive: boolean };
  sound: { label: string; isOn: boolean; onToggle: () => void };
  availabilityButton: { label: string; onClick: () => void };
  notice?: NoticeProps;
  isLoading: boolean;
  columns: KitchenColumnProps[];
  rejectDialog?: RejectDialogProps;
  availabilityPanel?: AvailabilityPanelProps;
};

export function KitchenBoard(p: KitchenBoardProps) {
  return (
    <div className={s.page}>
      <div className={s.top}>
        <h1 className={s.h1}>{p.title}</h1>
        <div className={s.tools}>
          <span className={`${s.conn} ${p.connection.isLive ? s.connLive : s.connDown}`} role="status">
            <span aria-hidden="true">{p.connection.isLive ? '●' : '⚠'}</span>{p.connection.label}
          </span>
          <Button label={p.sound.label} variant={p.sound.isOn ? 'secondary' : 'ghost'} onClick={p.sound.onToggle} />
          <Button label={p.availabilityButton.label} onClick={p.availabilityButton.onClick} />
        </div>
      </div>
      {p.notice ? <Notice {...p.notice} /> : null}
      {p.isLoading ? <p>Loading orders…</p> : (
        <div className={s.board}>
          {p.columns.map((c) => (
            <section key={c.id} className={s.column} aria-label={c.title}>
              <div className={s.colHead}>
                <h2 className={s.colTitle}>{c.title}</h2>
                <span className={s.count} aria-label={`${c.count} orders`}>{c.count}</span>
              </div>
              {c.cards.length === 0 ? <p className={s.empty}>{c.emptyText}</p> : (
                <div className={s.cards}>{c.cards.map((card) => <OrderCard key={card.id} {...card} />)}</div>
              )}
            </section>
          ))}
        </div>
      )}
      {p.rejectDialog ? (
        <Dialog
          title={p.rejectDialog.title}
          onClose={p.rejectDialog.onCancel}
          actions={
            <>
              <Button label="Back" onClick={p.rejectDialog.onCancel} isDisabled={p.rejectDialog.isBusy} />
              <Button label="Reject order" variant="secondary" onClick={p.rejectDialog.onConfirm} isLoading={p.rejectDialog.isBusy} />
            </>
          }
        >
          <div className={s.reasonWrap}>
            <strong>{p.rejectDialog.orderLabel}</strong>
            <TextField id="reject-reason" label="Reason (the customer may see this)" value={p.rejectDialog.reason} onChange={p.rejectDialog.onReasonChange} errorMessage={p.rejectDialog.errorMessage} maxLength={200} isMultiline isRequired />
          </div>
        </Dialog>
      ) : null}
      {p.availabilityPanel ? <AvailabilityPanel {...p.availabilityPanel} /> : null}
    </div>
  );
}
