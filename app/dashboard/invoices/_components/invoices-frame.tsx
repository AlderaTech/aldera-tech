import type { ReactNode } from "react";
import { ReceiptText } from "lucide-react";
import styles from "./invoices.module.css";
import { WorkspaceBanner } from "@/components/dashboard/workspace-banner";

export function InvoicesFrame({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page}>
      <WorkspaceBanner
        className={styles.header}
        aria-labelledby="invoices-heading"
        eyebrow="Keuangan proyek"
        badgeIcon={ReceiptText}
        mascotPose="invoice"
      >
        <div className={styles.headerCopy}>
          <h1 id="invoices-heading">Invoice &amp; Pembayaran</h1>
          <p className={styles.description}>
            Pantau tagihan, unduh invoice, dan konfirmasikan pembayaran Anda.
          </p>
        </div>
      </WorkspaceBanner>
      {children}
    </div>
  );
}
