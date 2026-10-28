"use client";

import { ParamFilterSelect } from "@/components/shared/param-filter-select";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./invoices.module.css";

export const INVOICE_STATUS_OPTIONS = [
  { value: "ALL", label: "Semua Status" },
  { value: "SENT", label: "Terkirim" },
  { value: "PAID", label: "Lunas" },
  { value: "OVERDUE", label: "Lewat Jatuh Tempo" },
  { value: "PENDING_VERIFICATION", label: "Menunggu Verifikasi" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

export function InvoiceStatusFilter({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={cn(styles.statusFilter, className)}>
      <span>
        <SlidersHorizontal aria-hidden="true" /> Status invoice
      </span>
      <ParamFilterSelect
        paramKey="status"
        options={INVOICE_STATUS_OPTIONS}
        placeholder="Semua Status"
        ariaLabel="Filter status invoice"
        className={styles.statusSelect}
      />
    </div>
  );
}
