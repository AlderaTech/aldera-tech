import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { AboutCta } from "./_components/about-cta";
import { AboutHero } from "./_components/about-hero";
import { AboutStory } from "./_components/about-story";
import { AboutValues } from "./_components/about-values";
import { AboutPurpose } from "./_components/about-purpose";
import { TechStackSection } from "./_components/tech-stack-section";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description:
    "Cerita di balik Aldera Tech: partner teknologi yang membantu bisnis Indonesia membangun produk digital yang bekerja.",
  alternates: { canonical: PUBLIC_ROUTES.about },
};

export default function AboutPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "Tentang Aldera Tech",
          url: `${appUrl}${PUBLIC_ROUTES.about}`,
          description: metadata.description,
          isPartOf: {
            "@type": "WebSite",
            url: appUrl,
            name: "Aldera Tech",
          },
        }}
      />
      <AboutHero />
      <AboutStory />
      <AboutPurpose />
      <AboutValues />
      <TechStackSection />
      <AboutCta />
    </>
  );
}
