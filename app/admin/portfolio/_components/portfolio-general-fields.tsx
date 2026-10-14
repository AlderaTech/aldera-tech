"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { PortfolioFormReturn } from "../_hooks/use-portfolio-form";

export function PortfolioGeneralFields({
  form,
}: {
  form: PortfolioFormReturn;
}) {
  return (
    <Card className="space-y-4 border p-5 shadow-sm">
      <h3 className="text-base font-semibold text-foreground">
        Informasi Utama
      </h3>

      <div className="space-y-2">
        <Label htmlFor="title">Judul Proyek / Studi Kasus *</Label>
        <Input
          id="title"
          placeholder="Contoh: Redesain Platform Mobile Banking Bank Syariah"
          value={form.title}
          onChange={(e) => form.setTitle(e.target.value)}
        />
        {form.errors.title && (
          <p className="text-xs text-destructive">{form.errors.title}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="slug">Slug URL *</Label>
          <Input
            id="slug"
            placeholder="redesain-platform-mobile-banking"
            value={form.slug}
            onChange={(e) => form.setSlug(e.target.value)}
          />
          {form.errors.slug && (
            <p className="text-xs text-destructive">{form.errors.slug}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="client">Nama Klien / Perusahaan *</Label>
          <Input
            id="client"
            placeholder="PT FinSmart Digital Indonesia"
            value={form.client}
            onChange={(e) => form.setClient(e.target.value)}
          />
          {form.errors.client && (
            <p className="text-xs text-destructive">{form.errors.client}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="industry">Sektor Industri *</Label>
          <Input
            id="industry"
            placeholder="Fintech & Banking"
            value={form.industry}
            onChange={(e) => form.setIndustry(e.target.value)}
          />
          {form.errors.industry && (
            <p className="text-xs text-destructive">{form.errors.industry}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="order">Urutan Tampil (Prioritas)</Label>
          <Input
            id="order"
            type="number"
            min={0}
            value={form.order}
            onChange={(e) => form.setOrder(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-3">
        <div>
          <Label htmlFor="published" className="cursor-pointer font-medium">
            Publikasikan ke Website
          </Label>
          <p className="text-xs text-muted-foreground">
            Jika aktif, studi kasus ini akan tampil di etalase portofolio
            publik.
          </p>
        </div>
        <Switch
          id="published"
          checked={form.published}
          onCheckedChange={form.setPublished}
        />
      </div>
    </Card>
  );
}
