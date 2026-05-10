import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/public-settings";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { ContactHero } from "./_components/contact-hero";
import { ContactSection } from "./_components/contact-section";

export const metadata: Metadata = {
  title: "Kontak",
  description:
    "Hubungi Solvo Tech untuk konsultasi gratis tentang proyek digital Anda.",
  alternates: { canonical: PUBLIC_ROUTES.contact },
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <ContactHero responseTime={settings.responseTime} />
      <ContactSection settings={settings} />
    </>
  );
}
