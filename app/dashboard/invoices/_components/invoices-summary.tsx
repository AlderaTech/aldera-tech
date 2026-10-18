import { CircleCheck, Clock3, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ClientInvoiceItem } from "../_types/invoice";
import { summarizeInvoices } from "../_utils/invoice-summary";
import styles from "./invoices.module.css";

export function InvoicesSummary({
  invoices,
}: {
  invoices: ClientInvoiceItem[];
}) {
  const summary = summarizeInvoices(invoices);
  const cards = [
    {
      key: "awaiting",
      label: "Menunggu pembayaran",
      hint: "Terkirim & lewat jatuh tempo",
      icon: Wallet,
      ...summary.awaiting,
    },
    {
      key: "verification",
      label: "Dalam verifikasi",
      hint: "Bukti pembayaran sedang ditinjau",
      icon: Clock3,
      ...summary.verification,
    },
    {
      key: "paid",
      label: "Telah dibayar",
      hint: "Invoice berstatus lunas",
      icon: CircleCheck,
      ...summary.paid,
    },
  ];
  return (
    <section className={styles.summary} aria-label="Ringkasan seluruh invoice">
      {cards.map(({ key, label, hint, icon: Icon, amount, count }) => (
        <article className={styles.summaryCard} data-tone={key} key={key}>
          <div className={styles.summaryTop}>
            <span className={styles.summaryIcon}>
              <Icon size={19} aria-hidden="true" />
            </span>
            <span>{count} invoice</span>
          </div>
          <h2>{label}</h2>
          <p className={styles.summaryAmount}>{formatCurrency(amount)}</p>
          <p className={styles.summaryHint}>{hint}</p>
        </article>
      ))}
    </section>
  );
}
