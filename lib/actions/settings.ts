"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  defaultPricingPlans,
  defaultSiteSettings,
  SITE_SETTING_ID,
} from "@/lib/public-settings";
import {
  pricingSettingsSchema,
  siteSettingsSchema,
} from "@/lib/validations/settings";

export type SettingsActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
};

async function requireSettingsAdmin() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "OWNER" && session.user.role !== "ADMIN")
  ) {
    throw new Error("Forbidden");
  }
  return session.user;
}

function clean(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

function collectErrors(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key) errors[key] = issue.message;
  }
  return errors;
}

export async function updateSiteSettingsAction(
  _: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  await requireSettingsAdmin();
  const parsed = siteSettingsSchema.safeParse({
    brandName: formData.get("brandName"),
    footerDescription: formData.get("footerDescription"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    address: formData.get("address"),
    mapsUrl: formData.get("mapsUrl"),
    operatingHours: formData.get("operatingHours"),
    responseTime: formData.get("responseTime"),
    githubUrl: formData.get("githubUrl"),
    linkedinUrl: formData.get("linkedinUrl"),
    instagramUrl: formData.get("instagramUrl"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali input settings.",
      errors: collectErrors(parsed.error),
    };
  }

  const data = parsed.data;
  await prisma.siteSetting.upsert({
    where: { id: SITE_SETTING_ID },
    create: {
      id: SITE_SETTING_ID,
      brandName: data.brandName,
      footerDescription: data.footerDescription,
      email: clean(data.email),
      phone: clean(data.phone),
      whatsapp: clean(data.whatsapp),
      address: clean(data.address),
      mapsUrl: clean(data.mapsUrl),
      operatingHours: clean(data.operatingHours),
      responseTime: data.responseTime,
      githubUrl: clean(data.githubUrl),
      linkedinUrl: clean(data.linkedinUrl),
      instagramUrl: clean(data.instagramUrl),
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
    },
    update: {
      brandName: data.brandName,
      footerDescription: data.footerDescription,
      email: clean(data.email),
      phone: clean(data.phone),
      whatsapp: clean(data.whatsapp),
      address: clean(data.address),
      mapsUrl: clean(data.mapsUrl),
      operatingHours: clean(data.operatingHours),
      responseTime: data.responseTime,
      githubUrl: clean(data.githubUrl),
      linkedinUrl: clean(data.linkedinUrl),
      instagramUrl: clean(data.instagramUrl),
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
    },
  });

  revalidateSettingsPaths();
  return { ok: true, message: "Informasi website berhasil disimpan." };
}

export async function updatePricingSettingsAction(
  _: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  await requireSettingsAdmin();
  const plans = defaultPricingPlans.map((fallback) => ({
    slug: fallback.slug,
    name: formData.get(`${fallback.slug}.name`),
    tagline: formData.get(`${fallback.slug}.tagline`),
    priceFrom: formData.get(`${fallback.slug}.priceFrom`),
    featured: formData.get("featuredPlan") === fallback.slug,
    ctaLabel: formData.get(`${fallback.slug}.ctaLabel`),
    ctaHref: formData.get(`${fallback.slug}.ctaHref`),
    includedFeatures: splitLines(formData.get(`${fallback.slug}.includedFeatures`)),
    excludedFeatures: splitLines(formData.get(`${fallback.slug}.excludedFeatures`)),
  }));

  const parsed = pricingSettingsSchema.safeParse({ plans });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa kembali input harga.",
      errors: collectErrors(parsed.error),
    };
  }

  await prisma.$transaction(async (tx) => {
    for (const plan of parsed.data.plans) {
      const fallback = defaultPricingPlans.find((item) => item.slug === plan.slug);
      const saved = await tx.pricingPlan.upsert({
        where: { slug: plan.slug },
        create: {
          slug: plan.slug,
          name: plan.name,
          tagline: plan.tagline,
          priceFrom: plan.priceFrom,
          featured: plan.featured,
          ctaLabel: plan.ctaLabel,
          ctaHref: plan.ctaHref,
          order: fallback?.order ?? 0,
        },
        update: {
          name: plan.name,
          tagline: plan.tagline,
          priceFrom: plan.priceFrom,
          featured: plan.featured,
          ctaLabel: plan.ctaLabel,
          ctaHref: plan.ctaHref,
          order: fallback?.order ?? 0,
        },
        select: { id: true },
      });

      await tx.pricingPlanFeature.deleteMany({
        where: { planId: saved.id },
      });
      await tx.pricingPlanFeature.createMany({
        data: [
          ...plan.includedFeatures.map((text, index) => ({
            planId: saved.id,
            text,
            included: true,
            order: index + 1,
          })),
          ...plan.excludedFeatures.map((text, index) => ({
            planId: saved.id,
            text,
            included: false,
            order: plan.includedFeatures.length + index + 1,
          })),
        ],
      });
    }
  });

  revalidateSettingsPaths();
  return { ok: true, message: "Harga berhasil disimpan." };
}

export async function ensureDefaultSettings() {
  await prisma.siteSetting.upsert({
    where: { id: SITE_SETTING_ID },
    update: {},
    create: {
      id: SITE_SETTING_ID,
      ...defaultSiteSettings,
      email: clean(defaultSiteSettings.email),
      phone: clean(defaultSiteSettings.phone),
      whatsapp: clean(defaultSiteSettings.whatsapp),
      address: clean(defaultSiteSettings.address),
      mapsUrl: clean(defaultSiteSettings.mapsUrl),
      operatingHours: clean(defaultSiteSettings.operatingHours),
      githubUrl: clean(defaultSiteSettings.githubUrl),
      linkedinUrl: clean(defaultSiteSettings.linkedinUrl),
      instagramUrl: clean(defaultSiteSettings.instagramUrl),
    },
  });
}

function splitLines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function revalidateSettingsPaths() {
  revalidatePath("/", "layout");
  revalidatePath("/pricing");
  revalidatePath("/contact");
  revalidatePath("/admin/settings");
}
