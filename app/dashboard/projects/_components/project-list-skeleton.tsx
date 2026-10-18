import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import styles from "./project-list.module.css";

export function ProjectListSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Memuat daftar proyek">
      <span className="sr-only">Memuat daftar proyek...</span>
      <div className={styles.listBar} aria-hidden="true">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-44" />
      </div>
      <div className={styles.grid} aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className={cn(styles.card, styles.skeletonCard)}>
            <div className={styles.cardTop}>
              <Skeleton className="size-10 rounded-xl" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="mt-5 h-5 w-4/5" />
            <Skeleton className="mt-3 h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-3/4" />
            <div className={styles.cardDetails}>
              <Skeleton className="mb-3 h-3 w-24" />
              <Skeleton className="h-1.5 w-full rounded-full" />
              <Skeleton className="mt-5 h-8 w-full" />
              <Skeleton className="mt-5 h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
