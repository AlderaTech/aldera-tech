import styles from "./onboarding-card.module.css";

export function OnboardingPieChart({
  completed,
  total,
  percent,
}: {
  completed: number;
  total: number;
  percent: number;
}) {
  return (
    <figure className={styles.chart} aria-label="Ringkasan progres onboarding">
      <svg viewBox="0 0 120 120" className={styles.pie} aria-hidden="true">
        <circle cx="60" cy="60" r="46" className={styles.track} />
        {total > 0 && percent > 0 && (
          <circle
            cx="60"
            cy="60"
            r="46"
            pathLength="100"
            strokeDasharray={`${percent} ${100 - percent}`}
            transform="rotate(-90 60 60)"
            className={styles.progressArc}
          />
        )}
        <text x="60" y="59" textAnchor="middle" className={styles.chartValue}>
          {percent}%
        </text>
        <text x="60" y="76" textAnchor="middle" className={styles.chartCaption}>
          Progres
        </text>
      </svg>
      <progress
        className="sr-only"
        value={percent}
        max={100}
        aria-label="Progres onboarding"
      >
        {percent}%
      </progress>
      <figcaption className={styles.legend}>
        <span>
          <i className={styles.completeDot} aria-hidden="true" /> Selesai{" "}
          <strong>{completed}</strong>
        </span>
        <span>
          <i className={styles.pendingDot} aria-hidden="true" /> Belum selesai{" "}
          <strong>{total - completed}</strong>
        </span>
      </figcaption>
    </figure>
  );
}
