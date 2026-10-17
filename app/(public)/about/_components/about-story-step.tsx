import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./about-story.module.css";

export function AboutStoryStep({
  icon: Icon,
  title,
  children,
  emphasized = false,
  className,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  emphasized?: boolean;
  className?: string;
}) {
  return (
    <article
      className={cn(styles.step, emphasized && styles.solution, className)}
    >
      <span className={styles.stepIcon}>
        <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <div className={styles.stepBody}>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
    </article>
  );
}
