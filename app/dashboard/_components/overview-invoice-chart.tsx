import { BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";
import { DASHBOARD_ROUTES } from "@/lib/routes";
import { formatCurrency } from "@/lib/utils";
import type { InvoiceDistribution } from "../_utils/overview-distributions";
import styles from "./overview.module.css";
import chart from "./overview-charts.module.css";

export function OverviewInvoiceChart({
  data,
  spent,
  active,
}: {
  data: InvoiceDistribution;
  spent: number;
  active: number;
}) {
  const total = data.paid + data.waiting + data.verification;
  const bars = [
    { label: "Lunas", count: data.paid, style: chart.columnFillPaid },
    { label: "Menunggu", count: data.waiting, style: chart.columnFillPending },
    {
      label: "Verifikasi",
      count: data.verification,
      style: chart.columnFillActive,
    },
  ];
  return (
    <article
      className={styles.panel}
      aria-labelledby="overview-barchart-heading"
    >
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>
            <BarChart3 aria-hidden="true" />
            Analitik Finansial
          </p>
          <h2 id="overview-barchart-heading" className={styles.sectionTitle}>
            Ringkasan Pembayaran Invoice
          </h2>
        </div>
        <Link href={DASHBOARD_ROUTES.invoices} className={styles.textLink}>
          Kelola Invoice <ArrowRight aria-hidden="true" />
        </Link>
      </div>
      <div className={chart.barLayout}>
        <div
          className={chart.columnChartBox}
          role="img"
          aria-label={bars
            .map((b) => `${b.label}: ${b.count} invoice`)
            .join(", ")}
        >
          <div className={chart.columnBars}>
            {bars.map((bar) => (
              <div key={bar.label} className={chart.columnItem}>
                <div className={chart.columnTrack}>
                  <div
                    className={bar.style}
                    style={{
                      height: `${total ? (bar.count / total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className={chart.columnLabel}>{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
        <dl className={chart.barMetrics}>
          <div className={chart.metricHeader}>
            <dt>Total dibayarkan</dt>
            <dd className="text-sm font-bold">{formatCurrency(spent)}</dd>
          </div>
          <div className={chart.metricHeader}>
            <dt>Invoice menunggu pembayaran</dt>
            <dd className="text-sm font-bold">{data.waiting} Tagihan</dd>
          </div>
          <div className={chart.metricHeader}>
            <dt>Bukti sedang diverifikasi</dt>
            <dd className="text-sm font-bold">{data.verification} Tagihan</dd>
          </div>
          <div className={chart.metricHeader}>
            <dt>Proyek aktif</dt>
            <dd className="text-sm font-bold">{active} Proyek</dd>
          </div>
        </dl>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        {total
          ? `Proporsi jumlah dari ${total} invoice terbit. Draf dan invoice batal tidak disertakan.`
          : "Belum ada invoice terbit."}
      </p>
    </article>
  );
}
