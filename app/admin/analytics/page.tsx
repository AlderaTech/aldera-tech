import { getAdminAnalytics } from "./_data/analytics";
import { AnalyticsContent } from "./_components/analytics-content";

export const metadata = {
  title: "Pendapatan & Profitabilitas",
  description:
    "Ringkasan pendapatan, biaya waktu kerja, dan profitabilitas proyek Aldera Tech.",
};

export default async function AnalyticsPage() {
  return <AnalyticsContent data={await getAdminAnalytics()} />;
}
