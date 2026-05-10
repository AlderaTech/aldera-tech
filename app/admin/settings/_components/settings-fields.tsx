import type { ComponentType, ReactNode } from "react";
import { CheckCircle2, Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PublicSiteSettings } from "@/lib/public-settings";

export function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: ReactNode;
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

export function HiddenProfileFields({
  settings,
}: {
  settings: PublicSiteSettings;
}) {
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

export function HiddenContactFields({
  settings,
}: {
  settings: PublicSiteSettings;
}) {
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

export function Field({
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

export function TextField({
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

export function SubmitBar({
  pending,
  label,
}: {
  pending: boolean;
  label: string;
}) {
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
