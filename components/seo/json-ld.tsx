import { getSiteSettings, getSocialLinks } from "@/lib/public-settings";

type JsonLdProps = {
  data: Record<string, unknown>;
};

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export async function OrganizationLd({ appUrl }: { appUrl: string }) {
  const settings = await getSiteSettings();
  const sameAs = getSocialLinks(settings).map((link) => link.href);
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: settings.brandName,
        url: appUrl,
        logo: `${appUrl}/logo/logo-transparent.png`,
        description: settings.seoDescription,
        sameAs: sameAs.length ? sameAs : undefined,
        contactPoint: {
          "@type": "ContactPoint",
          email: settings.email || undefined,
          telephone: settings.phone || settings.whatsapp || undefined,
          contactType: "customer service",
          areaServed: "ID",
          availableLanguage: ["Indonesian", "English"],
        },
      }}
    />
  );
}

export function WebSiteLd({
  appUrl,
  brandName,
}: {
  appUrl: string;
  brandName: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: brandName,
        url: appUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: `${appUrl}/blog?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

export function ArticleLd({
  appUrl,
  url,
  title,
  description,
  imageUrl,
  publishedAt,
  modifiedAt,
  authorName = "Aldera Tech Team",
}: {
  appUrl: string;
  url: string;
  title: string;
  description: string;
  imageUrl?: string;
  publishedAt: string;
  modifiedAt?: string;
  authorName?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
        headline: title,
        description,
        image: imageUrl ? [imageUrl] : undefined,
        datePublished: publishedAt,
        dateModified: modifiedAt || publishedAt,
        author: {
          "@type": "Organization",
          name: authorName,
          url: appUrl,
        },
        publisher: {
          "@type": "Organization",
          name: "Aldera Tech",
          logo: {
            "@type": "ImageObject",
            url: `${appUrl}/logo/logo-transparent.png`,
          },
        },
      }}
    />
  );
}

export function ServiceLd({
  appUrl,
  name,
  description,
  providerName = "Aldera Tech",
}: {
  appUrl: string;
  name: string;
  description: string;
  providerName?: string;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        name,
        description,
        provider: {
          "@type": "Organization",
          name: providerName,
          url: appUrl,
        },
      }}
    />
  );
}

export function FaqLd({
  items,
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }}
    />
  );
}
