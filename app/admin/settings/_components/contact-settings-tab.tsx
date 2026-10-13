"use client";

import { Globe2, Mail, MapPin } from "lucide-react";
import type { PublicSiteSettings } from "@/lib/public-settings";
import {
  Field,
  HiddenProfileFields,
  SettingsSection,
  SubmitBar,
  TextField,
} from "./settings-fields";

export function ContactSettingsTab({
  settings,
  action,
  pending,
}: {
  settings: PublicSiteSettings;
  action: (payload: FormData) => void;
  pending: boolean;
}) {
  return (
    <form action={action}>
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
      <SubmitBar pending={pending} label="Simpan kontak" />
    </form>
  );
}
