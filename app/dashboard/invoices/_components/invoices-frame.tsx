import type { ReactNode } from "react";
import { ReceiptText } from "lucide-react";
import { cn } from "@/lib/utils";
import common from "../../projects/_components/project-list.module.css";
import styles from "./invoices.module.css";

export function InvoicesFrame({ children }: { children: ReactNode }) {
  return (
    <div className={cn(common.page, styles.page)}>
      <header className={common.header}>
        <div>
          <p className={common.eyebrow}>Keuangan proyek</p>
          <h1>Invoice &amp; Pembayaran</h1>
          <p className={common.description}>
            Pantau tagihan, unduh invoice, dan konfirmasikan pembayaran Anda.
          </p>
        </div>
        <span className={styles.headerMark} aria-hidden="true">
          <ReceiptText />
        </span>
      </header>
      {children}
    </div>
  );
}
