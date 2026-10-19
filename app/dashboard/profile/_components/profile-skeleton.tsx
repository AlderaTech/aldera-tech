import { Skeleton } from "@/components/ui/skeleton";
import styles from "./profile.module.css";

export function ProfileSkeleton() {
  return (
    <div className={styles.layout} role="status" aria-label="Memuat profil">
      <div className={styles.identityCard}>
        <Skeleton className={styles.skeletonBanner} />
        <div className={styles.identityBody}>
          <Skeleton className="mb-5 size-16 rounded-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-8 h-12 w-full" />
        </div>
      </div>
      <div className={styles.formCard}>
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="mt-3 h-4 w-3/4" />
        {[0, 1].map((field) => (
          <div className={styles.skeletonField} key={field}>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-3 h-12 w-full" />
          </div>
        ))}
        <Skeleton className="ml-auto h-11 w-44 rounded-full" />
      </div>
    </div>
  );
}
