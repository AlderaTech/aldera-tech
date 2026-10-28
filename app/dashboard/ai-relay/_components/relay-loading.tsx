import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import styles from "./relay-workspace.module.css";

export function RelayLoading() {
  return (
    <div
      className={styles.workspace}
      role="status"
      aria-label="Memuat AI Relay"
    >
      <div className={styles.loadingHeader} aria-hidden="true">
        <div className={styles.welcome}>
          <div className="min-w-0 space-y-3">
            <Skeleton className="h-3 w-32 max-w-full" />
            <Skeleton className="h-7 w-60 max-w-full" />
            <Skeleton className="h-3 w-72 max-w-full" />
          </div>
          <Skeleton className="hidden size-20 shrink-0 rounded-2xl sm:block" />
        </div>
        <Skeleton className="h-20 w-60 rounded-2xl" />
      </div>
      <div className={styles.loadingTabs} aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-11 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-6 w-48 max-w-full" aria-hidden="true" />
      <div className="grid gap-4" data-relay-model-grid aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <Card key={index} className="space-y-4 p-5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}
