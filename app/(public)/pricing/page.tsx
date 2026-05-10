import type { Metadata } from "next";
import { getPricingPlans } from "@/lib/public-settings";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { pricingFaqs } from "./_constants/pricing-faqs";
import { PricingFaq } from "./_components/pricing-faq";
import { PricingGrid } from "./_components/pricing-grid";
import { PricingHero } from "./_components/pricing-hero";

export const metadata: Metadata = {
  title: "Harga",
  description:
    "Paket harga transparan untuk berbagai kebutuhan, dari landing page sederhana hingga platform enterprise.",
  alternates: { canonical: PUBLIC_ROUTES.pricing },
};

export default async function PricingPage() {
  const tiers = await getPricingPlans();
  return (
    <>
      <PricingHero />
      <PricingGrid plans={tiers} />
      <PricingFaq items={pricingFaqs} />
    </>
  );
}
