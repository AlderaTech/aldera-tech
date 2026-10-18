import { FolderKanban, Receipt, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { OverviewCounter } from "./overview-counter";
import styles from "./overview.module.css";

type OverviewStatsProps = { active: number; pending: number; spent: number };

export function OverviewStats({ active, pending, spent }: OverviewStatsProps) {
  const cards = [
    {
      label: "Proyek Aktif",
      value: active,
      icon: FolderKanban,
      className: styles.blueStat,
    },
    {
      label: "Invoice Pending",
      value: pending,
      icon: Receipt,
      className: styles.peachStat,
    },
    {
      label: "Total Dibayarkan",
      value: spent,
      icon: Wallet,
      className: styles.cyanStat,
      currency: true,
    },
  ];

  return (
    <section className={styles.stats} aria-label="Ringkasan statistik akun">
      {cards.map(({ label, value, icon: Icon, className, currency }) => (
        <article key={label} className={cn(styles.statCard, className)}>
          <span className={styles.statIcon} aria-hidden="true">
            <Icon />
          </span>
          <h2>{label}</h2>
          <p className={styles.statValue}>
            <OverviewCounter value={value} currency={currency} />
          </p>
        </article>
      ))}
    </section>
  );
}
