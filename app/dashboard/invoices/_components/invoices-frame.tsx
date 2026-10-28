import type { ReactNode } from "react";
import { ReceiptText } from "lucide-react";
import styles from "./invoices.module.css";

export function InvoicesFrame({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page}>
      <header className={styles.header} aria-labelledby="invoices-heading">
        <div className={styles.headerCopy}>
          <p className={styles.eyebrow}>
            <ReceiptText aria-hidden="true" /> Keuangan proyek
          </p>
          <h1 id="invoices-heading">Invoice &amp; Pembayaran</h1>
          <p className={styles.description}>
            Pantau tagihan, unduh invoice, dan konfirmasikan pembayaran Anda.
          </p>
        </div>
        <div className={styles.headerVisual} aria-hidden="true">
          <span className={styles.headerMark}>
            <ReceiptText strokeWidth={1.3} />
          </span>
          <span className={styles.headerLines} />
        </div>
      </header>
      {children}
    </div>
  );
}
