import type { InvoiceStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { invoiceStatusMeta } from "@/lib/status-meta";
import styles from "./invoices.module.css";

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const meta = invoiceStatusMeta[status];
  return (
    <Badge
      variant={meta.variant}
      className={styles.status}
      data-status={status}
    >
      <span aria-hidden="true" />
      {meta.label}
    </Badge>
  );
}
