import styles from "./_components/overview/admin-overview.module.css";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function AdminLoading() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Memuat dashboard admin"
    >
      <Skeleton className="h-8 w-60" />
      <div className={styles.statsGrid}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="space-y-3 p-5">
            <Skeleton className="size-10 rounded-lg" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-24" />
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <Skeleton className="h-64 w-full" />
      </Card>
    </div>
  );
}
