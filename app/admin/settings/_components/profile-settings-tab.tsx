"use client";

import { Building2, Search } from "lucide-react";
import type { PublicSiteSettings } from "@/lib/public-settings";
import {
  Field,
  HiddenContactFields,
  SettingsSection,
  SubmitBar,
  TextField,
} from "./settings-fields";

export function ProfileSettingsTab({
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
              placeholder="Aldera Tech"
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
              placeholder="Aldera Tech - Digital Product Studio"
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
      <SubmitBar pending={pending} label="Simpan profil" />
    </form>
  );
}
