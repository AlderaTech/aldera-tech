import { Skeleton } from "@/components/ui/skeleton";
import styles from "./invoices.module.css";

export function InvoicesSkeleton() {
  return (
    <div
      className={styles.loadingState}
      role="status"
      aria-label="Memuat invoice"
    >
      <div className={styles.summary}>
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className={styles.summarySkeleton} />
        ))}
      </div>
      <div className={styles.listPanel}>
        <div className={styles.listHeader}>
          <Skeleton className="h-5 w-40" />
        </div>
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className={styles.rowSkeleton} />
        ))}
      </div>
    </div>
  );
}
