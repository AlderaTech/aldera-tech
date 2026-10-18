import { CreditCard, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_ROUTES } from "@/lib/routes";
import type { ClientInvoiceItem } from "../_types/invoice";
import styles from "./invoices.module.css";

export function InvoiceActions({
  invoice,
  onPay,
}: {
  invoice: ClientInvoiceItem;
  onPay: (invoice: ClientInvoiceItem) => void;
}) {
  const canUpload =
    invoice.status === "SENT" ||
    invoice.status === "OVERDUE" ||
    invoice.status === "PENDING_VERIFICATION";
  const isVerification = invoice.status === "PENDING_VERIFICATION";
  const label = isVerification ? "Lihat Bukti" : "Bayar Tagihan";
  return (
    <div className={styles.actions}>
      {canUpload && (
        <Button
          size="sm"
          variant={isVerification ? "outline" : "default"}
          className={
            isVerification ? styles.secondaryAction : styles.paymentAction
          }
          onClick={() => onPay(invoice)}
          aria-label={`${label} ${invoice.number}`}
        >
          {isVerification ? (
            <Eye aria-hidden="true" />
          ) : (
            <CreditCard aria-hidden="true" />
          )}
          {label}
        </Button>
      )}
      <Button size="sm" variant="outline" className={styles.pdfAction} asChild>
        <a
          href={API_ROUTES.invoicePdf(invoice.id)}
          download
          aria-label={`Unduh PDF ${invoice.number}`}
        >
          <Download aria-hidden="true" />
          PDF
        </a>
      </Button>
    </div>
  );
}
