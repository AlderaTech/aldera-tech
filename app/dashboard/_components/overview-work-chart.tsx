import { PieChart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import type { WorkDistribution } from "../_utils/overview-distributions";
import styles from "./overview.module.css";
import chart from "./overview-charts.module.css";

export function OverviewWorkChart({ data }: { data: WorkDistribution }) {
  const total = data.completed + data.active + data.pending;
  const circumference = 2 * Math.PI * 44;
  const segments = [
    {
      label: "Selesai",
      count: data.completed,
      arc: chart.arcCompleted,
      dot: chart.dotCompleted,
    },
    {
      label: "Berjalan",
      count: data.active,
      arc: chart.arcInProgress,
      dot: chart.dotInProgress,
    },
    {
      label: "Menunggu",
      count: data.pending,
      arc: chart.arcPending,
      dot: chart.dotPending,
    },
  ];
  let offset = 0;
  return (
    <article className={styles.panel} aria-labelledby="overview-donut-heading">
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>
            <PieChart aria-hidden="true" />
            Visualisasi Progres
          </p>
          <h2 id="overview-donut-heading" className={styles.sectionTitle}>
            Distribusi Status Milestone &amp; Tugas
          </h2>
        </div>
        <Link href={DASHBOARD_ROUTES.projects} className={styles.textLink}>
          Detail Proyek <ArrowRight aria-hidden="true" />
        </Link>
      </div>
      <div className={chart.donutLayout}>
        <div className={chart.donutVisual}>
          <svg
            viewBox="0 0 120 120"
            className={chart.donutSvg}
            role="img"
            aria-label={`${total} milestone dan tugas: ${data.completed} selesai, ${data.active} berjalan, ${data.pending} menunggu.`}
          >
            <circle cx="60" cy="60" r="44" className={chart.donutTrack} />
            {segments.map((segment) => {
              const length = total
                ? (segment.count / total) * circumference
                : 0;
              const start = offset;
              offset += length;
              return length > 0 ? (
                <circle
                  key={segment.label}
                  cx="60"
                  cy="60"
                  r="44"
                  className={segment.arc}
                  strokeDasharray={`${length} ${circumference}`}
                  strokeDashoffset={-start}
                  transform="rotate(-90 60 60)"
                />
              ) : null;
            })}
            <text
              x="60"
              y="59"
              textAnchor="middle"
              className={chart.donutValue}
            >
              {total ? Math.round((data.completed / total) * 100) : 0}%
            </text>
            <text
              x="60"
              y="72"
              textAnchor="middle"
              className={chart.donutCaption}
            >
              Selesai
            </text>
          </svg>
        </div>
        <div className={chart.legendList}>
          {segments.map((segment) => (
            <div key={segment.label} className={chart.legendItem}>
              <div className={chart.legendTop}>
                <span className={chart.legendLabel}>
                  <span className={segment.dot} aria-hidden="true" />
                  <strong>{segment.label}</strong>
                </span>
                <span className={chart.legendPercent}>{segment.count}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {total
                  ? ((segment.count / total) * 100).toLocaleString("id-ID", {
                      maximumFractionDigits: 1,
                    })
                  : 0}
                % dari {total} milestone dan tugas
              </p>
            </div>
          ))}
          {!total && (
            <p className="text-sm text-muted-foreground">
              Belum ada milestone atau tugas.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
