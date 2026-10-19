"use client";

import { ParamFilterSelect } from "@/components/shared/param-filter-select";

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
    <div className={`flex items-center gap-2 ${className}`}>
      <label
        htmlFor="invoice-status-select"
        className="text-xs font-semibold whitespace-nowrap text-muted-foreground"
      >
        Status:
      </label>
      <ParamFilterSelect
        paramKey="status"
        options={INVOICE_STATUS_OPTIONS}
        placeholder="Semua Status"
        ariaLabel="Filter status invoice"
        className="h-8 w-44 rounded-lg bg-background text-xs"
      />
    </div>
  );
}
