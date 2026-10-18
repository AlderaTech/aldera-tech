import { Skeleton } from "@/components/ui/skeleton";
import commonStyles from "../../projects/_components/project-list.module.css";
import styles from "./orders.module.css";

export function OrdersSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Memuat riwayat estimasi">
      <span className="sr-only">Memuat riwayat estimasi...</span>
      <div className={commonStyles.listBar} aria-hidden="true">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-40" />
      </div>
      <div className={styles.list} aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div className={styles.card} key={index}>
            <div className={styles.top}>
              <div className={styles.identity}>
                <Skeleton className="size-11 shrink-0 rounded-xl" />
                <div className="grid min-w-0 gap-3">
                  <Skeleton className="h-5 w-40 max-w-full" />
                  <Skeleton className="h-6 w-28 rounded-full" />
                </div>
              </div>
              <div className="grid gap-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-40 max-w-full" />
              </div>
            </div>
            <div className={styles.metadata}>
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
