import { formatCurrency, formatDate } from "@/lib/utils";
import type { ClientInvoiceItem } from "../_types/invoice";
import { InvoiceActions } from "./invoice-actions";
import { InvoiceStatusBadge } from "./invoice-status";
import styles from "./invoices.module.css";

export function InvoiceDesktopTable({
  invoices,
  onPay,
}: {
  invoices: ClientInvoiceItem[];
  onPay: (invoice: ClientInvoiceItem) => void;
}) {
  return (
    <div className={styles.desktopTable}>
      <table>
        <caption className="sr-only">
          Seluruh invoice dan tindakan pembayaran
        </caption>
        <thead>
          <tr>
            <th scope="col">Invoice / Proyek</th>
            <th scope="col">Terbit</th>
            <th scope="col">Jatuh tempo</th>
            <th scope="col" className={styles.amountColumn}>
              Nominal
            </th>
            <th scope="col">Status</th>
            <th scope="col" className={styles.actionColumn}>
              Tindakan
            </th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <th scope="row">
                <span className={styles.invoiceNumber}>{invoice.number}</span>
                <span className={styles.projectName}>
                  {invoice.project?.title ?? "Tanpa proyek"}
                </span>
              </th>
              <td>{formatDate(invoice.issueDate, { month: "short" })}</td>
              <td data-overdue={invoice.status === "OVERDUE"}>
                {formatDate(invoice.dueDate, { month: "short" })}
              </td>
              <td className={styles.amountColumn}>
                {formatCurrency(invoice.total)}
              </td>
              <td>
                <InvoiceStatusBadge status={invoice.status} />
              </td>
              <td>
                <InvoiceActions invoice={invoice} onPay={onPay} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
