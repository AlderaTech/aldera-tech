import type {
  InvoiceDistribution,
  WorkDistribution,
} from "../_utils/overview-distributions";
import { OverviewWorkChart } from "./overview-work-chart";
import { OverviewInvoiceChart } from "./overview-invoice-chart";
import chartStyles from "./overview-charts.module.css";

export function OverviewCharts({
  active,
  spent,
  work,
  payments,
}: {
  active: number;
  spent: number;
  work: WorkDistribution;
  payments: InvoiceDistribution;
}) {
  return (
    <section
      className={chartStyles.chartsGrid}
      aria-label="Visualisasi analitik proyek dan pembayaran"
    >
      <OverviewWorkChart data={work} />
      <OverviewInvoiceChart data={payments} spent={spent} active={active} />
    </section>
  );
}
