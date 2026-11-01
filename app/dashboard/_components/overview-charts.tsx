import type { Milestone, Project } from "@prisma/client";
import Link from "next/link";
import { ArrowRight, BarChart3, PieChart } from "lucide-react";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import { formatCurrency } from "@/lib/utils";
import styles from "./overview.module.css";
import chartStyles from "./overview-charts.module.css";

type ChartProject = Pick<Project, "id" | "title" | "status" | "progress"> & {
  milestones?: Pick<Milestone, "title" | "dueDate">[];
};

export type OverviewChartsProps = {
  active: number;
  pending: number;
  spent: number;
  projects: ChartProject[];
};

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function OverviewCharts({
  active,
  pending,
  spent,
  projects,
}: OverviewChartsProps) {
  const avgProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce(
            (sum, p) => sum + Math.min(Math.max(p.progress, 0), 100),
            0
          ) / projects.length
        )
      : 0;

  const completedPct = Math.min(Math.max(avgProgress, 0), 100);
  const inProgressPct =
    projects.length === 0 || completedPct >= 100
      ? 0
      : Math.min(
          100 - completedPct,
          active > 0 ? Math.max(15, Math.round((100 - completedPct) * 0.6)) : 0
        );
  const pendingPct =
    projects.length === 0 ? 0 : Math.max(0, 100 - completedPct - inProgressPct);

  const completedArc = (completedPct / 100) * CIRCUMFERENCE;
  const inProgressArc = (inProgressPct / 100) * CIRCUMFERENCE;
  const pendingArc = (pendingPct / 100) * CIRCUMFERENCE;

  const paidBarHeight =
    spent > 0 ? Math.min(100, Math.max(38, completedPct || 75)) : 12;
  const pendingBarHeight =
    pending > 0 ? Math.min(100, Math.max(28, pending * 28)) : 12;
  const activeBarHeight =
    active > 0 ? Math.min(100, Math.max(32, active * 32)) : 12;

  const donutSegments = [
    {
      key: "completed",
      label: "Selesai",
      caption: "Tahapan & milestone tuntas",
      percent: completedPct,
      dotClass: chartStyles.dotCompleted,
      fillClass: chartStyles.fillCompleted,
    },
    {
      key: "in-progress",
      label: "Berjalan",
      caption: "Sprint & integrasi aktif",
      percent: inProgressPct,
      dotClass: chartStyles.dotInProgress,
      fillClass: chartStyles.fillInProgress,
    },
    {
      key: "pending",
      label: "Pending",
      caption: "Menunggu jadwal berikutnya",
      percent: pendingPct,
      dotClass: chartStyles.dotPending,
      fillClass: chartStyles.fillPending,
    },
  ];

  return (
    <section
      className={chartStyles.chartsGrid}
      aria-label="Visualisasi analitik proyek dan pembayaran"
    >
      {/* Donut / Pie Chart Card */}
      <article
        className={styles.panel}
        aria-labelledby="overview-donut-heading"
      >
        <div className={styles.panelHeader}>
          <div>
            <p className={styles.eyebrow}>
              <PieChart aria-hidden="true" /> Visualisasi Progres
            </p>
            <h2 id="overview-donut-heading" className={styles.sectionTitle}>
              Distribusi Status Milestone &amp; Tugas
            </h2>
          </div>
          <Link href={DASHBOARD_ROUTES.projects} className={styles.textLink}>
            Detail Proyek <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className={chartStyles.donutLayout}>
          <div className={chartStyles.donutVisual}>
            <svg
              viewBox="0 0 120 120"
              className={chartStyles.donutSvg}
              role="img"
              aria-label={`Distribusi milestone: Selesai ${completedPct}%, Berjalan ${inProgressPct}%, Pending ${pendingPct}%`}
            >
              <circle
                cx="60"
                cy="60"
                r={RADIUS}
                className={chartStyles.donutTrack}
              />
              {pendingPct > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r={RADIUS}
                  className={chartStyles.arcPending}
                  strokeDasharray={`${pendingArc} ${CIRCUMFERENCE}`}
                  strokeDashoffset={-(completedArc + inProgressArc)}
                  transform="rotate(-90 60 60)"
                />
              )}
              {inProgressPct > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r={RADIUS}
                  className={chartStyles.arcInProgress}
                  strokeDasharray={`${inProgressArc} ${CIRCUMFERENCE}`}
                  strokeDashoffset={-completedArc}
                  transform="rotate(-90 60 60)"
                />
              )}
              {completedPct > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r={RADIUS}
                  className={chartStyles.arcCompleted}
                  strokeDasharray={`${completedArc} ${CIRCUMFERENCE}`}
                  strokeDashoffset={0}
                  transform="rotate(-90 60 60)"
                />
              )}
              <text
                x="60"
                y="57"
                textAnchor="middle"
                className={chartStyles.donutValue}
              >
                {completedPct}%
              </text>
              <text
                x="60"
                y="72"
                textAnchor="middle"
                className={chartStyles.donutCaption}
              >
                Selesai
              </text>
            </svg>
          </div>

          <div className={chartStyles.legendList}>
            {donutSegments.map((seg) => (
              <div key={seg.key} className={chartStyles.legendItem}>
                <div className={chartStyles.legendTop}>
                  <span className={chartStyles.legendLabel}>
                    <span className={seg.dotClass} aria-hidden="true" />
                    <strong>{seg.label}</strong>
                    <small>{seg.caption}</small>
                  </span>
                  <span className={chartStyles.legendPercent}>
                    {seg.percent}%
                  </span>
                </div>
                <div className={chartStyles.miniTrack} aria-hidden="true">
                  <div
                    className={seg.fillClass}
                    style={{ width: `${seg.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>

      {/* Bar Chart Card */}
      <article
        className={styles.panel}
        aria-labelledby="overview-barchart-heading"
      >
        <div className={styles.panelHeader}>
          <div>
            <p className={styles.eyebrow}>
              <BarChart3 aria-hidden="true" /> Analitik Finansial
            </p>
            <h2 id="overview-barchart-heading" className={styles.sectionTitle}>
              Ringkasan Pembayaran Invoice
            </h2>
          </div>
          <Link href={DASHBOARD_ROUTES.invoices} className={styles.textLink}>
            Kelola Invoice <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className={chartStyles.barLayout}>
          <div
            className={chartStyles.columnChartBox}
            role="img"
            aria-label={`Grafik batang: Total Dibayarkan ${formatCurrency(spent)}, Invoice Pending ${pending}, Proyek Aktif ${active}`}
          >
            <div className={chartStyles.columnBars}>
              <div className={chartStyles.columnItem}>
                <div className={chartStyles.columnTrack}>
                  <div
                    className={chartStyles.columnFillPaid}
                    style={{ height: `${paidBarHeight}%` }}
                  />
                </div>
                <span className={chartStyles.columnLabel}>Lunas</span>
              </div>
              <div className={chartStyles.columnItem}>
                <div className={chartStyles.columnTrack}>
                  <div
                    className={chartStyles.columnFillPending}
                    style={{ height: `${pendingBarHeight}%` }}
                  />
                </div>
                <span className={chartStyles.columnLabel}>Pending</span>
              </div>
              <div className={chartStyles.columnItem}>
                <div className={chartStyles.columnTrack}>
                  <div
                    className={chartStyles.columnFillActive}
                    style={{ height: `${activeBarHeight}%` }}
                  />
                </div>
                <span className={chartStyles.columnLabel}>Aktif</span>
              </div>
            </div>
          </div>

          <div className={chartStyles.barMetrics}>
            <div className={chartStyles.metricRow}>
              <div className={chartStyles.metricHeader}>
                <span>Total Dibayarkan (Lunas)</span>
                <strong>{formatCurrency(spent)}</strong>
              </div>
              <div className={chartStyles.miniTrack} aria-hidden="true">
                <div
                  className={chartStyles.fillPaid}
                  style={{ width: `${paidBarHeight}%` }}
                />
              </div>
            </div>

            <div className={chartStyles.metricRow}>
              <div className={chartStyles.metricHeader}>
                <span>Invoice Pending</span>
                <strong>
                  {pending} Tagihan{" "}
                  <small>
                    ({pending > 0 ? "Menunggu pembayaran" : "Semua lunas"})
                  </small>
                </strong>
              </div>
              <div className={chartStyles.miniTrack} aria-hidden="true">
                <div
                  className={chartStyles.fillPending}
                  style={{ width: `${pendingBarHeight}%` }}
                />
              </div>
            </div>

            <div className={chartStyles.metricRow}>
              <div className={chartStyles.metricHeader}>
                <span>Proyek Aktif Berjalan</span>
                <strong>{active} Proyek</strong>
              </div>
              <div className={chartStyles.miniTrack} aria-hidden="true">
                <div
                  className={chartStyles.fillCompleted}
                  style={{ width: `${activeBarHeight}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
