import type { InvoiceStatus } from "@prisma/client";
import { Download, Receipt } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { invoiceStatusMeta } from "@/lib/status-meta";
import { formatCurrency, formatDate } from "@/lib/utils";
import { API_ROUTES } from "@/lib/routes";
import styles from "./project-detail.module.css";

export interface ProjectInvoiceItem {
  id: string;
  number: string;
  status: InvoiceStatus;
  dueDate: Date;
  total: unknown;
}

interface ProjectInvoicesTabProps {
  invoices: ProjectInvoiceItem[];
}

export function ProjectInvoicesTab({ invoices }: ProjectInvoicesTabProps) {
  return (
    <section
      className={styles.panel}
      aria-labelledby="project-invoices-heading"
    >
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>
            <Receipt className="size-3.5" aria-hidden="true" /> Keuangan Proyek
          </p>
          <h2 id="project-invoices-heading" className={styles.panelTitle}>
            Daftar Invoice Proyek
          </h2>
          <p className={styles.panelSubtitle}>
            Rincian tagihan dan bukti pembayaran yang terkait dengan proyek ini.
          </p>
        </div>
        <span className={styles.countBadge}>{invoices.length} Invoice</span>
      </div>

      {invoices.length === 0 ? (
        <div className={styles.emptyBox}>
          Belum ada invoice untuk proyek ini.
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => {
            const m = invoiceStatusMeta[inv.status];
            return (
              <div key={inv.id} className={styles.invoiceRow}>
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#e1e8f2] bg-[#e8f0ff] text-[#245fe5]">
                    <Receipt className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    <div className="text-sm font-bold text-[#102651]">
                      {inv.number}
                    </div>
                    <div className="text-xs font-medium text-[#65748b]">
                      Jatuh tempo: {formatDate(inv.dueDate)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant={m.variant}>{m.label}</Badge>
                  <span className="text-sm font-extrabold text-[#102651] tabular-nums">
                    {formatCurrency(Number(inv.total))}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#e1e8f2] bg-[#f5f8fd] font-semibold text-[#102651] hover:border-[#245fe5] hover:bg-[#e8f0ff] hover:text-[#245fe5]"
                    asChild
                  >
                    <a href={API_ROUTES.invoicePdf(inv.id)} download>
                      <Download className="size-3.5" /> PDF
                    </a>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
