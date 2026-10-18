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
      <div
        className="flex flex-wrap items-center justify-between gap-5"
        aria-hidden="true"
      >
        <div className="flex max-w-full min-w-0 items-center gap-4">
          <Skeleton className="hidden size-20 shrink-0 rounded-2xl sm:block" />
          <div className="min-w-0 space-y-3">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-7 w-60" />
            <Skeleton className="h-3 w-72 max-w-full" />
          </div>
        </div>
        <Skeleton className="h-20 w-60 rounded-2xl" />
      </div>
      <Skeleton className="h-16 w-full rounded-2xl" />
      <div
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        aria-hidden="true"
      >
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
