"use client";

import type { PublicPricingPlan } from "@/lib/public-settings";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { Field, SubmitBar, TextField } from "./settings-fields";

export function PricingSettingsTab({
  pricingPlans,
  action,
  pending,
}: {
  pricingPlans: PublicPricingPlan[];
  action: (payload: FormData) => void;
  pending: boolean;
}) {
  return (
    <form action={action}>
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
                  placeholder={PUBLIC_ROUTES.contactWithPlan("starter")}
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
      <SubmitBar pending={pending} label="Simpan harga" />
    </form>
  );
}
