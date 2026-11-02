import Image from "next/image";
import type { ReactNode } from "react";
import illustration from "@/public/images/about/technology/design.webp";
import { EmptyStatePattern } from "@/app/dashboard/_components/empty-state-pattern";
import {
  ADMIN_EMPTY_CONTEXTS,
  type AdminEmptyContext,
} from "../_data/admin-empty-contexts";
import styles from "./admin-common.module.css";

export function AdminEmptyState({
  title,
  description,
  action,
  context = "general",
  label,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  context?: AdminEmptyContext;
  label?: string;
}) {
  const content = ADMIN_EMPTY_CONTEXTS[context];
  return (
    <div
      className={styles.empty}
      data-admin-empty
      data-admin-empty-context={context}
    >
      <EmptyStatePattern />
      <Image
        src={illustration}
        alt=""
        aria-hidden="true"
        width={120}
        height={120}
        sizes="(max-width: 639px) 104px, 120px"
        className={styles.emptyIllustration}
      />
      <div className={styles.emptyCopy}>
        <p className={styles.emptyLabel}>{label ?? content.label}</p>
        <h3>{title ?? content.title}</h3>
        <p className={styles.emptyDescription}>
          {description ?? content.description}
        </p>
      </div>
      {action && <div className={styles.emptyAction}>{action}</div>}
    </div>
  );
}
