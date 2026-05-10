import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .url("URL tidak valid")
  .optional()
  .or(z.literal(""));

export const siteSettingsSchema = z.object({
  brandName: z.string().trim().min(2).max(80),
  footerDescription: z.string().trim().min(20).max(600),
  email: z.string().trim().email("Email tidak valid").optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
  address: z.string().trim().max(240).optional().or(z.literal("")),
  mapsUrl: optionalUrl,
  operatingHours: z.string().trim().max(300).optional().or(z.literal("")),
  responseTime: z.string().trim().min(2).max(80),
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  instagramUrl: optionalUrl,
  seoTitle: z.string().trim().min(10).max(120),
  seoDescription: z.string().trim().min(30).max(240),
});

export const pricingPlanSettingsSchema = z.object({
  slug: z.enum(["starter", "professional", "enterprise"]),
  name: z.string().trim().min(2).max(80),
  tagline: z.string().trim().min(10).max(240),
  priceFrom: z.coerce.number().min(0),
  featured: z.boolean().default(false),
  ctaLabel: z.string().trim().min(2).max(80),
  ctaHref: z.string().trim().min(1).max(160),
  includedFeatures: z.array(z.string().trim().min(1).max(180)).max(20),
  excludedFeatures: z.array(z.string().trim().min(1).max(180)).max(20),
});

export const pricingSettingsSchema = z.object({
  plans: z.array(pricingPlanSettingsSchema).length(3),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
export type PricingSettingsInput = z.infer<typeof pricingSettingsSchema>;
