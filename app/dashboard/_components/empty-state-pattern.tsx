import styles from "./empty-state-pattern.module.css";
import { cn } from "@/lib/utils";

export function EmptyStatePattern({ className }: { className?: string } = {}) {
  return (
    <div className={cn(styles.decoration, className)} aria-hidden="true">
      <svg
        viewBox="0 0 260 260"
        fill="none"
        focusable="false"
        className={styles.circuit}
      >
        <g className={styles.traces}>
          <path d="M260 38H189L153 74H107M260 187H221L188 154H129L96 187H42M260 215H209L185 191H150M230 0V37L204 63" />
          <circle cx="107" cy="74" r="4" />
          <circle cx="42" cy="187" r="4" />
          <circle cx="150" cy="191" r="4" />
          <circle cx="204" cy="63" r="4" />
        </g>
        <rect
          x="148"
          y="84"
          width="79"
          height="58"
          rx="14"
          className={styles.codePanel}
        />
        <path
          d="m172 104-9 9 9 9m31-18 9 9-9 9m-10-24-9 30"
          className={styles.codeMark}
        />
      </svg>
    </div>
  );
}
