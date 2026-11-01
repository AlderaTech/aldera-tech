import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AdminIconArt, type AdminIconArtworkKey } from "./admin-icon-art";
import styles from "./admin-common.module.css";

type AdminStatCardProps = {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  helper?: string;
  toneClassName?: string;
  artwork?: AdminIconArtworkKey;
};
export function AdminStatCard({
  icon: Icon,
  label,
  value,
  helper,
  toneClassName = "text-primary bg-primary/10 border-primary/20",
  artwork,
}: AdminStatCardProps) {
  return (
    <Card className={styles.stat} data-admin-stat>
      <CardContent className={styles.statContent}>
        <div className={styles.statTop}>
          <h2 className={styles.statLabel}>{label}</h2>
          <span
            className={cn(styles.statIcon, toneClassName)}
            aria-hidden="true"
          >
            <AdminIconArt artwork={artwork} hint={label} size="stat" />
            <span className={styles.statIconBadge}>
              <Icon size={11} />
            </span>
          </span>
        </div>
        <div className={styles.statBody}>
          <p className={styles.statValue}>{value}</p>
          {helper && <p className={styles.statHelper}>{helper}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
