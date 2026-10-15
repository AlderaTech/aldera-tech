import type { Metadata } from "next";
import { services } from "@/lib/services-data";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { ServicesCta } from "./_components/services-cta";
import { ServicesGrid } from "./_components/services-grid";
import { ServicesHero } from "./_components/services-hero";

export const metadata: Metadata = {
  title: "Layanan",
  description:
    "Pengembangan web, aplikasi mobile, desain UI/UX, e-commerce, SEO, dan konsultasi teknologi untuk bisnis Anda.",
  alternates: { canonical: PUBLIC_ROUTES.services },
};

export default async function ServicesPage() {
  const serviceList = await safeDb(async () => {
    const data = await prisma.service.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
    return data && data.length > 0 ? data : services;
  }, services);

  return (
    <>
      <ServicesHero />
      <ServicesGrid services={serviceList} />
      <ServicesCta />
    </>
  );
}
