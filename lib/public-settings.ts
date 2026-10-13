import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { PUBLIC_ROUTES } from "@/lib/routes";

export const SITE_SETTING_ID = "site";

export type PublicSiteSettings = {
  brandName: string;
  footerDescription: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  mapsUrl: string;
  operatingHours: string;
  responseTime: string;
  githubUrl: string;
  linkedinUrl: string;
  instagramUrl: string;
  seoTitle: string;
  seoDescription: string;
};

export type PublicPricingPlan = {
  slug: string;
  name: string;
  tagline: string;
  priceFrom: number;
  featured: boolean;
  ctaLabel: string;
  ctaHref: string;
  order: number;
  features: { text: string; included: boolean; order: number }[];
};

export const defaultSiteSettings: PublicSiteSettings = {
  brandName: "Solvo Tech",
  footerDescription:
    "Partner teknologi untuk bisnis modern. Kami membangun web, aplikasi mobile, dan sistem yang bekerja, transparan dari awal sampai rilis.",
  email: "hello@solvo.tech",
  phone: "",
  whatsapp: "",
  address: "Jakarta, Indonesia",
  mapsUrl: "",
  operatingHours: "Senin - Jumat: 09:00 - 18:00 WIB",
  responseTime: "1x24 jam",
  githubUrl: "",
  linkedinUrl: "",
  instagramUrl: "",
  seoTitle: "Solvo Tech: Solusi Digital untuk Bisnis Modern",
  seoDescription:
    "Solvo Tech adalah partner teknologi untuk pengembangan web, aplikasi mobile, dan desain UI/UX. Transparan, profesional, dan berorientasi hasil.",
};

export const defaultPricingPlans: PublicPricingPlan[] = [
  {
    slug: "starter",
    name: "Starter",
    tagline: "Untuk UMKM dan brand baru yang butuh hadir online.",
    priceFrom: 7_500_000,
    featured: false,
    ctaLabel: "Mulai Starter",
    ctaHref: PUBLIC_ROUTES.contactWithPlan("starter"),
    order: 1,
    features: [
      { text: "Landing page hingga 5 halaman", included: true, order: 1 },
      { text: "Desain responsif", included: true, order: 2 },
      { text: "SEO on-page dasar", included: true, order: 3 },
      {
        text: "Form kontak dan integrasi kanal pesan",
        included: true,
        order: 4,
      },
      { text: "Blog / CMS sederhana", included: false, order: 5 },
      { text: "Payment gateway", included: false, order: 6 },
      { text: "Dashboard admin", included: false, order: 7 },
    ],
  },
  {
    slug: "professional",
    name: "Professional",
    tagline: "Untuk bisnis yang serius scaling dan butuh platform lengkap.",
    priceFrom: 25_000_000,
    featured: true,
    ctaLabel: "Mulai Professional",
    ctaHref: PUBLIC_ROUTES.contactWithPlan("professional"),
    order: 2,
    features: [
      { text: "Semua fitur Starter", included: true, order: 1 },
      { text: "Halaman fleksibel dan CMS lengkap", included: true, order: 2 },
      { text: "SEO teknis mendalam", included: true, order: 3 },
      { text: "Dashboard admin kustom", included: true, order: 4 },
      { text: "Payment gateway (Midtrans/Xendit)", included: true, order: 5 },
      { text: "Integrasi email marketing", included: true, order: 6 },
      { text: "Multi-tenancy", included: false, order: 7 },
    ],
  },
  {
    slug: "enterprise",
    name: "Enterprise",
    tagline: "Untuk kebutuhan kompleks dengan SLA dan integrasi kustom.",
    priceFrom: 75_000_000,
    featured: false,
    ctaLabel: "Hubungi Sales",
    ctaHref: PUBLIC_ROUTES.contactWithPlan("enterprise"),
    order: 3,
    features: [
      { text: "Semua fitur Professional", included: true, order: 1 },
      { text: "Arsitektur kustom + multi-tenancy", included: true, order: 2 },
      { text: "Integrasi API pihak ketiga", included: true, order: 3 },
      { text: "SLA 99.9%", included: true, order: 4 },
      { text: "Dukungan khusus", included: true, order: 5 },
      { text: "Audit keamanan", included: true, order: 6 },
      { text: "Serah terima source code", included: true, order: 7 },
    ],
  },
];

function normalize(value: string | null | undefined) {
  return value?.trim() ?? "";
}

export const getSiteSettings = cache(async (): Promise<PublicSiteSettings> => {
  return safeDb(async () => {
    const settings = await prisma.siteSetting.findUnique({
      where: { id: SITE_SETTING_ID },
    });
    if (!settings) return defaultSiteSettings;
    return {
      brandName: settings.brandName,
      footerDescription: settings.footerDescription,
      email: normalize(settings.email),
      phone: normalize(settings.phone),
      whatsapp: normalize(settings.whatsapp),
      address: normalize(settings.address),
      mapsUrl: normalize(settings.mapsUrl),
      operatingHours: normalize(settings.operatingHours),
      responseTime: settings.responseTime,
      githubUrl: normalize(settings.githubUrl),
      linkedinUrl: normalize(settings.linkedinUrl),
      instagramUrl: normalize(settings.instagramUrl),
      seoTitle: settings.seoTitle,
      seoDescription: settings.seoDescription,
    };
  }, defaultSiteSettings);
});

export const getPricingPlans = cache(async (): Promise<PublicPricingPlan[]> => {
  return safeDb(async () => {
    const plans = await prisma.pricingPlan.findMany({
      orderBy: { order: "asc" },
      include: { features: { orderBy: { order: "asc" } } },
    });
    if (!plans.length) return defaultPricingPlans;
    return plans.map((plan) => ({
      slug: plan.slug,
      name: plan.name,
      tagline: plan.tagline,
      priceFrom: Number(plan.priceFrom),
      featured: plan.featured,
      ctaLabel: plan.ctaLabel,
      ctaHref: plan.ctaHref,
      order: plan.order,
      features: plan.features.map((feature) => ({
        text: feature.text,
        included: feature.included,
        order: feature.order,
      })),
    }));
  }, defaultPricingPlans);
});

export function getSocialLinks(settings: PublicSiteSettings) {
  return [
    { label: "GitHub", href: settings.githubUrl },
    { label: "LinkedIn", href: settings.linkedinUrl },
    { label: "Instagram", href: settings.instagramUrl },
  ].filter((link) => link.href);
}
