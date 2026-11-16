import type { LucideIcon } from "lucide-react";
import styles from "./studio-page-hero.module.css";

export function StudioPageHero({
  label,
  title,
  description,
  icon: Icon,
}: {
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <p className={styles.badge}>
          <Icon className="size-4" aria-hidden="true" />
          {label} / Aldera Tech
        </p>
        <h1 className={styles.heading}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </div>
    </section>
  );
}
