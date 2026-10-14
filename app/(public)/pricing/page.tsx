import type { Metadata } from "next";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { getPricingPlans, getSiteSettings } from "@/lib/public-settings";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { pricingFaqs } from "./_constants/pricing-faqs";
import { PricingFaq } from "./_components/pricing-faq";
import { PricingGrid } from "./_components/pricing-grid";
import { PricingHero } from "./_components/pricing-hero";
import { PricingCalculatorSection } from "./_components/pricing-calculator-section";
import type { CalculatorData } from "./_types/calculator";

export const metadata: Metadata = {
  title: "Harga & Kalkulator Estimasi",
  description:
    "Paket harga transparan dan kalkulator estimasi biaya proyek interaktif untuk berbagai kebutuhan, dari MVP hingga platform enterprise.",
  alternates: { canonical: PUBLIC_ROUTES.pricing },
};

export default async function PricingPage() {
  const [session, tiers, settings, calculatorData] = await Promise.all([
    auth(),
    getPricingPlans(),
    getSiteSettings(),
    safeDb<CalculatorData>(
      async () => {
        const [projectTypes, features, addOns, config] = await Promise.all([
          prisma.projectType.findMany({
            where: { active: true },
            orderBy: { order: "asc" },
          }),
          prisma.featureOption.findMany({
            where: { active: true },
            orderBy: { order: "asc" },
          }),
          prisma.addOnOption.findMany({
            where: { active: true },
            orderBy: { order: "asc" },
          }),
          prisma.calculatorConfig.findUnique({ where: { id: "calculator" } }),
        ]);

        return {
          projectTypes: projectTypes.map((pt) => ({
            ...pt,
            basePrice: Number(pt.basePrice),
          })),
          features: features.map((f) => ({
            ...f,
            price: Number(f.price),
          })),
          addOns: addOns.map((a) => ({
            ...a,
            pricePerMonth: Number(a.pricePerMonth),
          })),
          config: config
            ? {
                ...config,
                revisionPricePerItem: Number(config.revisionPricePerItem),
                urgencyMultiplier: Number(config.urgencyMultiplier),
              }
            : null,
        };
      },
      { projectTypes: [], features: [], addOns: [], config: null }
    ),
  ]);

  return (
    <>
      <PricingHero />
      <PricingGrid plans={tiers} />
      <PricingCalculatorSection
        data={calculatorData}
        isAuthenticated={Boolean(session?.user)}
        whatsappNumber={settings.whatsapp}
      />
      <PricingFaq items={pricingFaqs} />
    </>
  );
}
