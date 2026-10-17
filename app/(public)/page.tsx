import type { Metadata } from "next";
import { HomeHero } from "./_components/home/home-hero";
import { FeaturesSection } from "./_components/home/features-section";
import { ServicesPreview } from "./_components/home/services-preview";
import { PortfolioPreview } from "./_components/home/portfolio-preview";
import { TestimonialsSection } from "./_components/home/testimonials-section";
import { CtaSection } from "./_components/home/cta-section";
import { HomeSummary } from "./_components/home/home-summary";
import { ServicesIntro } from "./_components/home/services-intro";
import styles from "./_components/home/home-sections.module.css";
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
      <div className={styles.sections}>
        <HomeHero />
        <HomeSummary />
        <ServicesIntro />
        <CtaSection />
        <ServicesPreview />
        <FeaturesSection />
        <PortfolioPreview />
        <TestimonialsSection />
      </div>
    </>
  );
}
