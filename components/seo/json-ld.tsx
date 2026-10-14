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
          contactType: "layanan pelanggan",
          areaServed: "ID",
          availableLanguage: ["Indonesian", "English"],
        },
      }}
    />
  );
}
