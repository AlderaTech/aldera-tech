import type { Metadata } from "next";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { PortfolioGrid } from "./_components/portfolio-grid";
import { PortfolioHero } from "./_components/portfolio-hero";
import { getPortfolioItems } from "./_data/portfolio";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Lihat portofolio proyek terbaru Solvo Tech: dari SaaS B2B, e-commerce, hingga aplikasi mobile.",
  alternates: { canonical: PUBLIC_ROUTES.portfolio },
};

export default async function PortfolioPage() {
  const items = await getPortfolioItems();

  return (
    <>
      <PortfolioHero />
      <PortfolioGrid items={items} />
    </>
  );
}
