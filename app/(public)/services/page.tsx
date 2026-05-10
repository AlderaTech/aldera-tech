import type { Metadata } from "next";
import { services } from "@/lib/services-data";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { ServicesCta } from "./_components/services-cta";
import { ServicesGrid } from "./_components/services-grid";
import { ServicesHero } from "./_components/services-hero";

export const metadata: Metadata = {
  title: "Layanan",
  description:
    "Pengembangan web, aplikasi mobile, desain UI/UX, e-commerce, SEO, dan konsultasi teknologi untuk bisnis Anda.",
  alternates: { canonical: PUBLIC_ROUTES.services },
};

export default function ServicesPage() {
  return (
    <>
      <ServicesHero />
      <ServicesGrid services={services} />
      <ServicesCta />
    </>
  );
}
