import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { FaqGroups } from "./_components/faq-groups";
import { FaqHero } from "./_components/faq-hero";
import { faqGroups } from "./_constants/faq-groups";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Pertanyaan yang sering ditanyakan tentang layanan, proses kerja, dan kerjasama dengan Aldera Tech.",
  alternates: { canonical: PUBLIC_ROUTES.faq },
};

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqGroups.flatMap((g) =>
            g.items.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: f.a,
              },
            }))
          ),
        }}
      />
      <FaqHero />
      <FaqGroups groups={faqGroups} />
    </>
  );
}
