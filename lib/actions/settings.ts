"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { defaultSiteSettings, SITE_SETTING_ID } from "@/lib/public-settings";
import { siteSettingsSchema } from "@/lib/validations/settings";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";

export type SettingsActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
};

async function requireSettingsAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return session.user;
}

function clean(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

function collectErrors(error: {
  issues: { path: PropertyKey[]; message: string }[];
}) {
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

export async function ensureDefaultSettings() {
  await prisma.siteSetting.upsert({
    where: { id: SITE_SETTING_ID },
    update: {
      brandName: defaultSiteSettings.brandName,
      footerDescription: defaultSiteSettings.footerDescription,
      email: clean(defaultSiteSettings.email),
      seoTitle: defaultSiteSettings.seoTitle,
      seoDescription: defaultSiteSettings.seoDescription,
    },
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

function revalidateSettingsPaths() {
  revalidatePath(PUBLIC_ROUTES.home, "layout");
  revalidatePath(PUBLIC_ROUTES.pricing);
  revalidatePath(PUBLIC_ROUTES.contact);
  revalidatePath(ADMIN_ROUTES.settings);
}
