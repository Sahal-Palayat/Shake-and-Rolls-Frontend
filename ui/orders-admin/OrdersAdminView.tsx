import { Button } from '../common/Button';
import { Notice, type NoticeProps } from '../common/Notice';
import { SelectField } from '../common/SelectField';
import { StatusBadge, type StatusTone } from '../common/StatusBadge';
import { TextField } from '../common/TextField';
import { OrderDetailDialog, type OrderDetailDialogProps } from './OrderDetailDialog';
import s from './orders-admin.module.css';

export type OrderRowProps = {
  id: string;
  orderNumber: string;
  whenLabel: string;
  customerLabel: string;
  totalLabel: string;
  badge: { label: string; tone: StatusTone };
  paymentLabel: string;
  riderLabel: string;
  onOpen: () => void;
};

export type OrdersAdminViewProps = {
  title: string;
  notice?: NoticeProps;
  isLoading: boolean;
  filters: {
    status: { value: string; options: { value: string; label: string }[]; onChange: (v: string) => void };
    payment: { value: string; options: { value: string; label: string }[]; onChange: (v: string) => void };
    search: { value: string; onChange: (v: string) => void };
    from: { value: string; onChange: (v: string) => void };
    to: { value: string; onChange: (v: string) => void };
    onClear: () => void;
  };
  countLabel: string;
  emptyText: string;
  rows: OrderRowProps[];
  onRefresh: () => void;
  detail?: OrderDetailDialogProps;
};

export function OrdersAdminView(p: OrdersAdminViewProps) {
  const f = p.filters;
  return (
    <div className={s.page}>
      <div className={s.top}>
        <h1 className={s.h1}>{p.title}</h1>
        <Button label="Refresh" onClick={p.onRefresh} />
      </div>
      {p.notice ? <Notice {...p.notice} /> : null}
      <div className={s.filters}>
        <SelectField id="f-status" label="Status" value={f.status.value} options={f.status.options} onChange={f.status.onChange} />
        <SelectField id="f-pay" label="Payment" value={f.payment.value} options={f.payment.options} onChange={f.payment.onChange} />
        <TextField id="f-search" type="search" label="Order no., name or phone" value={f.search.value} onChange={f.search.onChange} />
        <TextField id="f-from" type="date" label="From" value={f.from.value} onChange={f.from.onChange} />
        <TextField id="f-to" type="date" label="To" value={f.to.value} onChange={f.to.onChange} />
        <Button label="Clear filters" onClick={f.onClear} />
      </div>
      <span className={s.muted}>{p.countLabel}</span>
      <div className={s.tableWrap}>
        {p.isLoading ? <p className={s.empty}>Loading…</p> : p.rows.length === 0 ? <p className={s.empty}>{p.emptyText}</p> : (
          <table className={s.table}>
            <thead><tr><th scope="col">Order</th><th scope="col">Placed</th><th scope="col">Customer</th><th scope="col">Total</th><th scope="col">Status</th><th scope="col">Payment</th><th scope="col">Rider</th><th scope="col"><span className="sr-only">Open</span></th></tr></thead>
            <tbody>
              {p.rows.map((r) => (
                <tr key={r.id}>
                  <td className={s.num}>{r.orderNumber}</td>
                  <td>{r.whenLabel}</td>
                  <td>{r.customerLabel}</td>
                  <td><strong>{r.totalLabel}</strong></td>
                  <td><StatusBadge label={r.badge.label} tone={r.badge.tone} /></td>
                  <td>{r.paymentLabel}</td>
                  <td>{r.riderLabel}</td>
                  <td><Button label="Open" size="sm" variant="primary" onClick={r.onOpen} ariaLabel={`Open order ${r.orderNumber}`} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {p.detail ? <OrderDetailDialog {...p.detail} /> : null}
    </div>
  );
}
