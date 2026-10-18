import { formatCurrency, formatDate } from "@/lib/utils";
import type { ClientInvoiceItem } from "../_types/invoice";
import { InvoiceActions } from "./invoice-actions";
import { InvoiceStatusBadge } from "./invoice-status";
import styles from "./invoices.module.css";

export function InvoiceMobileCards({
  invoices,
  onPay,
}: {
  invoices: ClientInvoiceItem[];
  onPay: (invoice: ClientInvoiceItem) => void;
}) {
  return (
    <div className={styles.mobileCards}>
      {invoices.map((invoice) => (
        <article className={styles.mobileCard} key={invoice.id}>
          <div className={styles.mobileCardTop}>
            <h3 className={styles.invoiceNumber}>{invoice.number}</h3>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <p className={styles.projectName}>
            {invoice.project?.title ?? "Tanpa proyek"}
          </p>
          <dl className={styles.mobileDetails}>
            <div className={styles.mobileAmount}>
              <dt>Nominal tagihan</dt>
              <dd>{formatCurrency(invoice.total)}</dd>
            </div>
            <div>
              <dt>Tanggal terbit</dt>
              <dd>{formatDate(invoice.issueDate, { month: "short" })}</dd>
            </div>
            <div>
              <dt>Jatuh tempo</dt>
              <dd data-overdue={invoice.status === "OVERDUE"}>
                {formatDate(invoice.dueDate, { month: "short" })}
              </dd>
            </div>
          </dl>
          <InvoiceActions invoice={invoice} onPay={onPay} />
        </article>
      ))}
    </div>
  );
}
