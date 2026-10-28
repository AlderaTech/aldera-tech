import { Skeleton } from "@/components/ui/skeleton";
import styles from "./profile.module.css";
import preview from "./profile-preview.module.css";

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
      <div className={preview.dashboardGrid} aria-hidden="true">
        <div className={preview.panel}>
          <Skeleton className="h-6 w-48 max-w-full" />
          {[0, 1, 2].map((index) => (
            <Skeleton className="h-36 w-full rounded-2xl" key={index} />
          ))}
        </div>
        <div className={preview.rightColumn}>
          <div className={preview.panel}>
            <Skeleton className="h-6 w-40 max-w-full" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className={preview.panel}>
            <Skeleton className="h-16 w-full rounded-xl" />
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
