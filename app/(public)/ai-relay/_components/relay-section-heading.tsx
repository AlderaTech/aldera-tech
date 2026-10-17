import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./relay.module.css";

export function RelaySectionHeading({
  id,
  index,
  eyebrow,
  title,
  variant = "split",
  children,
}: {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  variant?: "split" | "center" | "indexed";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        styles.sectionHeading,
        variant === "center" && styles.sectionHeadingCenter,
        variant === "indexed" && styles.sectionHeadingIndexed
      )}
    >
      <p className={styles.eyebrow}>
        <span aria-hidden="true">{index}</span>
        {eyebrow}
      </p>
      <h2 id={id}>{title}</h2>
      <p className={styles.sectionDescription}>{children}</p>
    </div>
  );
}
