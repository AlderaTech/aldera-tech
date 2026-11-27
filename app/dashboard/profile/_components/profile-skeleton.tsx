import { Skeleton } from "@/components/ui/skeleton";
import styles from "./profile.module.css";

export function ProfileSkeleton() {
  return (
    <div className={styles.workspace} role="status" aria-label="Memuat profil">
      <div className={styles.identityCard} aria-hidden="true">
        <div className={styles.identityMain}>
          <Skeleton className={styles.avatar} />
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-3 w-24 max-w-full" />
            <Skeleton className="h-6 w-48 max-w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
        <Skeleton className="h-28 w-28 max-w-full rounded-xl" />
      </div>
      <div className={styles.formCard} aria-hidden="true">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 max-w-full" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <div className={styles.formFields}>
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-32 max-w-full" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-3 w-52 max-w-full" />
          </div>
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-40 max-w-full" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-3 w-64 max-w-full" />
          </div>
        </div>
        <div className={styles.formFooter}>
          <Skeleton className="h-4 w-56 max-w-full" />
          <Skeleton className="h-12 w-40 max-w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
