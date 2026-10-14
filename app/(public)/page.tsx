import type { Metadata } from "next";
import { HomeHero } from "./_components/home/home-hero";
import { FeaturesSection } from "./_components/home/features-section";
import { ServicesPreview } from "./_components/home/services-preview";
import { PortfolioPreview } from "./_components/home/portfolio-preview";
import { TestimonialsSection } from "./_components/home/testimonials-section";
import { CtaSection } from "./_components/home/cta-section";
import { OrganizationLd } from "@/components/seo/json-ld";
import { PUBLIC_ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Aldera Tech: Solusi Digital untuk Bisnis Modern",
  description:
    "Partner teknologi untuk web, aplikasi mobile, dan UI/UX. Kami bangun solusi yang bekerja untuk pertumbuhan bisnis Anda.",
  alternates: { canonical: PUBLIC_ROUTES.home },
};

export default function HomePage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return (
    <>
      <OrganizationLd appUrl={appUrl} />
      <HomeHero />
      <FeaturesSection />
      <ServicesPreview />
      <PortfolioPreview />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
