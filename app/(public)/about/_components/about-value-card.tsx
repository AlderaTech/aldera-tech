import { cn } from "@/lib/utils";
import type { AboutValue } from "../_constants/about-content";
import styles from "./about-values.module.css";

export function AboutValueCard({
  value,
  position,
  featured = false,
  className,
}: {
  value: AboutValue;
  position: number;
  featured?: boolean;
  className?: string;
}) {
  const Icon = value.icon;

  return (
    <article
      className={cn(styles.card, featured && styles.featured, className)}
    >
      <span className={styles.valueIcon}>
        <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <div className={styles.valueCopy}>
        <h3>{value.title}</h3>
        <p>{value.description}</p>
      </div>
      <span className={styles.valueIndex} aria-hidden="true">
        {String(position).padStart(2, "0")}
      </span>
    </article>
  );
}
