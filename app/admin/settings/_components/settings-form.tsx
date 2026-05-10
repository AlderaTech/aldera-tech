"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  PublicPricingPlan,
  PublicSiteSettings,
} from "@/lib/public-settings";
import {
  updatePricingSettingsAction,
  updateSiteSettingsAction,
  type SettingsActionState,
} from "@/lib/actions/settings";

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
    <Tabs defaultValue="profile" className="p-6">
      <TabsList className="mb-6">
        <TabsTrigger value="profile">Profil Website</TabsTrigger>
        <TabsTrigger value="contact">Sosial & Kontak</TabsTrigger>
        <TabsTrigger value="pricing">Harga</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <form action={siteAction} className="space-y-6">
          <HiddenContactFields settings={settings} />
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Nama brand" name="brandName" defaultValue={settings.brandName} />
            <Field label="Waktu respon" name="responseTime" defaultValue={settings.responseTime} />
          </div>
          <TextField
            label="Deskripsi footer"
            name="footerDescription"
            defaultValue={settings.footerDescription}
            rows={4}
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="SEO title" name="seoTitle" defaultValue={settings.seoTitle} />
            <TextField
              label="SEO description"
              name="seoDescription"
              defaultValue={settings.seoDescription}
              rows={3}
            />
          </div>
          <SubmitButton pending={sitePending} label="Simpan profil" />
        </form>
      </TabsContent>

      <TabsContent value="contact">
        <form action={siteAction} className="space-y-6">
          <HiddenProfileFields settings={settings} />
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Email publik" name="email" defaultValue={settings.email} />
            <Field label="Nomor telepon" name="phone" defaultValue={settings.phone} />
            <Field label="WhatsApp" name="whatsapp" defaultValue={settings.whatsapp} />
            <Field label="Alamat" name="address" defaultValue={settings.address} />
          </div>
          <Field label="Google Maps URL" name="mapsUrl" defaultValue={settings.mapsUrl} />
          <TextField
            label="Jam operasional"
            name="operatingHours"
            defaultValue={settings.operatingHours}
            rows={3}
          />
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="GitHub URL" name="githubUrl" defaultValue={settings.githubUrl} />
            <Field label="LinkedIn URL" name="linkedinUrl" defaultValue={settings.linkedinUrl} />
            <Field label="Instagram URL" name="instagramUrl" defaultValue={settings.instagramUrl} />
          </div>
          <SubmitButton pending={sitePending} label="Simpan kontak" />
        </form>
      </TabsContent>

      <TabsContent value="pricing">
        <form action={pricingAction} className="space-y-6">
          <div className="grid gap-5 xl:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div key={plan.slug} className="rounded-xl border p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-semibold">{plan.name}</h2>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
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
                <Field
                  label="Nama paket"
                  name={`${plan.slug}.name`}
                  defaultValue={plan.name}
                />
                <TextField
                  label="Tagline"
                  name={`${plan.slug}.tagline`}
                  defaultValue={plan.tagline}
                  rows={3}
                />
                <Field
                  label="Harga mulai"
                  name={`${plan.slug}.priceFrom`}
                  type="number"
                  defaultValue={String(plan.priceFrom)}
                />
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <Field
                    label="Label CTA"
                    name={`${plan.slug}.ctaLabel`}
                    defaultValue={plan.ctaLabel}
                  />
                  <Field
                    label="Link CTA"
                    name={`${plan.slug}.ctaHref`}
                    defaultValue={plan.ctaHref}
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
                />
                <TextField
                  label="Fitur belum termasuk, satu per baris"
                  name={`${plan.slug}.excludedFeatures`}
                  defaultValue={plan.features
                    .filter((feature) => !feature.included)
                    .map((feature) => feature.text)
                    .join("\n")}
                  rows={4}
                />
              </div>
            ))}
          </div>
          <SubmitButton pending={pricingPending} label="Simpan harga" />
        </form>
      </TabsContent>
    </Tabs>
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
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} defaultValue={defaultValue} type={type} />
    </div>
  );
}

function TextField({
  label,
  name,
  defaultValue,
  rows,
}: {
  label: string;
  name: string;
  defaultValue: string;
  rows: number;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Textarea id={name} name={name} defaultValue={defaultValue} rows={rows} />
    </div>
  );
}

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <div className="flex justify-end">
      <Button type="submit" disabled={pending} size="lg">
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
