"use client";

import * as React from "react";
import { useActionState } from "react";
import {
  Building2,
  CheckCircle2,
  Globe2,
  Loader2,
  Mail,
  MapPin,
  Save,
  Search,
  Share2,
  Tags,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  updatePricingSettingsAction,
  updateSiteSettingsAction,
  type SettingsActionState,
} from "@/lib/actions/settings";
import type {
  PublicPricingPlan,
  PublicSiteSettings,
} from "@/lib/public-settings";
import { cn } from "@/lib/utils";

const initialState: SettingsActionState = { ok: false };

export function SettingsForm({
  settings,
  pricingPlans,
}: {
  settings: PublicSiteSettings;
  pricingPlans: PublicPricingPlan[];
}) {
  const [siteState, siteAction, sitePending] = useActionState(
    updateSiteSettingsAction,
    initialState
  );
  const [pricingState, pricingAction, pricingPending] = useActionState(
    updatePricingSettingsAction,
    initialState
  );

  React.useEffect(() => {
    if (siteState.message) {
      if (siteState.ok) toast.success(siteState.message);
      else toast.error(siteState.message);
    }
  }, [siteState]);

  React.useEffect(() => {
    if (pricingState.message) {
      if (pricingState.ok) toast.success(pricingState.message);
      else toast.error(pricingState.message);
    }
  }, [pricingState]);

  return (
    <Tabs defaultValue="profile" className="gap-0">
      <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-3 sm:px-5">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto bg-white p-1 shadow-sm sm:w-max">
          <TabsTrigger value="profile" className="gap-2">
            <Building2 className="size-4" />
            Profil Website
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <Share2 className="size-4" />
            Sosial & Kontak
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-2">
            <Tags className="size-4" />
            Harga
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="profile">
        <form action={siteAction}>
          <HiddenContactFields settings={settings} />
          <div className="divide-y divide-slate-200">
            <SettingsSection
              icon={Building2}
              title="Identitas brand"
              description="Informasi utama yang tampil di landing page dan metadata publik."
            >
              <div className="grid gap-3 lg:grid-cols-2">
                <Field
                  label="Nama brand"
                  name="brandName"
                  defaultValue={settings.brandName}
                  placeholder="Solvo Tech"
                />
                <Field
                  label="Waktu respon"
                  name="responseTime"
                  defaultValue={settings.responseTime}
                  placeholder="Respon dalam 1x24 jam"
                />
              </div>
              <TextField
                label="Deskripsi footer"
                name="footerDescription"
                defaultValue={settings.footerDescription}
                rows={4}
                placeholder="Deskripsi singkat yang tampil di footer"
              />
            </SettingsSection>

            <SettingsSection
              icon={Search}
              title="SEO"
              description="Judul dan deskripsi yang digunakan untuk metadata mesin pencari."
            >
              <div className="grid gap-3 lg:grid-cols-2">
                <Field
                  label="SEO title"
                  name="seoTitle"
                  defaultValue={settings.seoTitle}
                  placeholder="Solvo Tech - Digital Product Studio"
                />
                <TextField
                  label="SEO description"
                  name="seoDescription"
                  defaultValue={settings.seoDescription}
                  rows={3}
                  placeholder="Deskripsi SEO untuk halaman publik"
                />
              </div>
            </SettingsSection>
          </div>
          <SubmitBar pending={sitePending} label="Simpan profil" />
        </form>
      </TabsContent>

      <TabsContent value="contact">
        <form action={siteAction}>
          <HiddenProfileFields settings={settings} />
          <div className="divide-y divide-slate-200">
            <SettingsSection
              icon={Mail}
              title="Kontak publik"
              description="Data yang tampil di footer, halaman kontak, dan CTA WhatsApp."
            >
              <div className="grid gap-3 lg:grid-cols-2">
                <Field
                  label="Email publik"
                  name="email"
                  defaultValue={settings.email}
                  type="email"
                  placeholder="hello@solvotech.id"
                />
                <Field
                  label="Nomor telepon"
                  name="phone"
                  defaultValue={settings.phone}
                  placeholder="+62 812 3456 7890"
                />
                <Field
                  label="WhatsApp"
                  name="whatsapp"
                  defaultValue={settings.whatsapp}
                  placeholder="+62 812 3456 7890"
                />
                <Field
                  label="Alamat"
                  name="address"
                  defaultValue={settings.address}
                  placeholder="Jakarta, Indonesia"
                />
              </div>
            </SettingsSection>

            <SettingsSection
              icon={MapPin}
              title="Lokasi & jam operasional"
              description="Informasi operasional yang membantu calon client menghubungi tim."
            >
              <Field
                label="Google Maps URL"
                name="mapsUrl"
                defaultValue={settings.mapsUrl}
                type="url"
                placeholder="https://maps.google.com/..."
              />
              <TextField
                label="Jam operasional"
                name="operatingHours"
                defaultValue={settings.operatingHours}
                rows={3}
                placeholder="Senin - Jumat, 09.00 - 18.00 WIB"
              />
            </SettingsSection>

            <SettingsSection
              icon={Globe2}
              title="Sosial media"
              description="Link eksternal yang dipakai oleh footer dan area sosial."
            >
              <div className="grid gap-3 lg:grid-cols-3">
                <Field
                  label="GitHub URL"
                  name="githubUrl"
                  defaultValue={settings.githubUrl}
                  type="url"
                  placeholder="https://github.com/solvotech"
                />
                <Field
                  label="LinkedIn URL"
                  name="linkedinUrl"
                  defaultValue={settings.linkedinUrl}
                  type="url"
                  placeholder="https://linkedin.com/company/solvotech"
                />
                <Field
                  label="Instagram URL"
                  name="instagramUrl"
                  defaultValue={settings.instagramUrl}
                  type="url"
                  placeholder="https://instagram.com/solvotech"
                />
              </div>
            </SettingsSection>
          </div>
          <SubmitBar pending={sitePending} label="Simpan kontak" />
        </form>
      </TabsContent>

      <TabsContent value="pricing">
        <form action={pricingAction}>
          <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.slug}
                className={cn(
                  "rounded-2xl border bg-white p-4 shadow-sm",
                  plan.featured
                    ? "border-primary/30 ring-2 ring-primary/10"
                    : "border-slate-200"
                )}
              >
                <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="font-semibold text-slate-950">{plan.name}</h2>
                    <p className="text-xs text-slate-500">{plan.slug}</p>
                  </div>
                  <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                    <input
                      type="radio"
                      name="featuredPlan"
                      value={plan.slug}
                      defaultChecked={plan.featured}
                      className="size-4"
                    />
                    Unggulan
                  </label>
                </div>

                <div className="space-y-3">
                  <Field
                    label="Nama paket"
                    name={`${plan.slug}.name`}
                    defaultValue={plan.name}
                    placeholder="Nama paket layanan"
                  />
                  <TextField
                    label="Tagline"
                    name={`${plan.slug}.tagline`}
                    defaultValue={plan.tagline}
                    rows={3}
                    placeholder="Tagline singkat untuk paket ini"
                  />
                  <Field
                    label="Harga mulai"
                    name={`${plan.slug}.priceFrom`}
                    type="number"
                    defaultValue={String(plan.priceFrom)}
                    placeholder="15000000"
                  />
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <Field
                      label="Label CTA"
                      name={`${plan.slug}.ctaLabel`}
                      defaultValue={plan.ctaLabel}
                      placeholder="Konsultasi Sekarang"
                    />
                    <Field
                      label="Link CTA"
                      name={`${plan.slug}.ctaHref`}
                      defaultValue={plan.ctaHref}
                      placeholder="/contact?plan=starter"
                    />
                  </div>
                  <TextField
                    label="Fitur termasuk, satu per baris"
                    name={`${plan.slug}.includedFeatures`}
                    defaultValue={plan.features
                      .filter((feature) => feature.included)
                      .map((feature) => feature.text)
                      .join("\n")}
                    rows={7}
                    placeholder={"Discovery workshop\nUI/UX design\nDevelopment"}
                  />
                  <TextField
                    label="Fitur belum termasuk, satu per baris"
                    name={`${plan.slug}.excludedFeatures`}
                    defaultValue={plan.features
                      .filter((feature) => !feature.included)
                      .map((feature) => feature.text)
                      .join("\n")}
                    rows={4}
                    placeholder={"Biaya domain\nKonten copywriting tambahan"}
                  />
                </div>
              </div>
            ))}
          </div>
          <SubmitBar pending={pricingPending} label="Simpan harga" />
        </form>
      </TabsContent>
    </Tabs>
  );
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="flex gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            {description}
          </p>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function HiddenProfileFields({ settings }: { settings: PublicSiteSettings }) {
  return (
    <>
      <input type="hidden" name="brandName" value={settings.brandName} />
      <input
        type="hidden"
        name="footerDescription"
        value={settings.footerDescription}
      />
      <input type="hidden" name="responseTime" value={settings.responseTime} />
      <input type="hidden" name="seoTitle" value={settings.seoTitle} />
      <input type="hidden" name="seoDescription" value={settings.seoDescription} />
    </>
  );
}

function HiddenContactFields({ settings }: { settings: PublicSiteSettings }) {
  return (
    <>
      <input type="hidden" name="email" value={settings.email} />
      <input type="hidden" name="phone" value={settings.phone} />
      <input type="hidden" name="whatsapp" value={settings.whatsapp} />
      <input type="hidden" name="address" value={settings.address} />
      <input type="hidden" name="mapsUrl" value={settings.mapsUrl} />
      <input type="hidden" name="operatingHours" value={settings.operatingHours} />
      <input type="hidden" name="githubUrl" value={settings.githubUrl} />
      <input type="hidden" name="linkedinUrl" value={settings.linkedinUrl} />
      <input type="hidden" name="instagramUrl" value={settings.instagramUrl} />
    </>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-xs font-semibold text-slate-700">
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        defaultValue={defaultValue}
        type={type}
        placeholder={placeholder}
        className="h-10 bg-white"
      />
    </div>
  );
}

function TextField({
  label,
  name,
  defaultValue,
  rows,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue: string;
  rows: number;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-xs font-semibold text-slate-700">
        {label}
      </Label>
      <Textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        placeholder={placeholder}
        className="bg-white"
      />
    </div>
  );
}

function SubmitBar({ pending, label }: { pending: boolean; label: string }) {
  return (
    <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-5">
      <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
        {pending ? (
          <Loader2 className="size-4 animate-spin text-primary" />
        ) : (
          <CheckCircle2 className="size-4 text-primary" />
        )}
        Perubahan akan diterapkan ke halaman publik setelah disimpan.
      </div>
      <Button type="submit" disabled={pending} className="ml-auto h-10">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Menyimpan...
          </>
        ) : (
          <>
            <Save className="size-4" /> {label}
          </>
        )}
      </Button>
    </div>
  );
}
