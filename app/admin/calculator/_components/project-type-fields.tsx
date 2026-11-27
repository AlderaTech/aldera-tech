"use client";

import { Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AdminIconArt,
  type AdminIconArtworkKey,
} from "../../_components/admin-icon-art";

export interface DependentFieldItem {
  label: string;
  type: string;
  pricePerUnit: number;
  unit: string;
  min?: number;
  max?: number;
}

export interface ProjectIconOption {
  value: string;
  label: string;
  caption: string;
  artwork: AdminIconArtworkKey;
}

export const PROJECT_ICON_OPTIONS: readonly ProjectIconOption[] = [
  {
    value: "code2",
    label: "Web & SaaS",
    caption: "Aplikasi web",
    artwork: "service-web",
  },
  {
    value: "smartphone",
    label: "Mobile App",
    caption: "iOS & Android",
    artwork: "service-mobile",
  },
  {
    value: "shoppingBag",
    label: "E-Commerce",
    caption: "Toko online",
    artwork: "service-commerce",
  },
  {
    value: "layers",
    label: "Enterprise",
    caption: "Sistem & AI",
    artwork: "service-ai",
  },
  {
    value: "globe",
    label: "Web & SEO",
    caption: "Company profile",
    artwork: "service-seo",
  },
  {
    value: "palette",
    label: "UI/UX Design",
    caption: "Desain produk",
    artwork: "service-design",
  },
] as const;

export function parseDependentFields(raw: unknown): DependentFieldItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null
    )
    .map((item) => ({
      label: typeof item.label === "string" ? item.label : "",
      type: typeof item.type === "string" ? item.type : "number",
      pricePerUnit: Number(item.pricePerUnit || 0),
      unit: typeof item.unit === "string" ? item.unit : "unit",
      min: item.min !== undefined ? Number(item.min) : 1,
      max: item.max !== undefined ? Number(item.max) : 50,
    }));
}

interface ProjectTypeIconPickerProps {
  value: string;
  onChange: (nextValue: string) => void;
}

export function ProjectTypeIconPicker({
  value,
  onChange,
}: ProjectTypeIconPickerProps) {
  return (
    <div className="space-y-2.5">
      <input type="hidden" name="icon" value={value} />

      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-medium">
          Visual & Ikon Kategori{" "}
          <span className="text-xs font-normal text-muted-foreground">
            (Opsional)
          </span>
        </Label>
        <Badge
          variant="outline"
          className="bg-white px-2 py-0 font-mono text-[11px] text-slate-600"
        >
          {PROJECT_ICON_OPTIONS.find((opt) => opt.value === value)?.label ??
            value}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {PROJECT_ICON_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={isSelected}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-all",
                isSelected
                  ? "border-primary bg-white shadow-2xs ring-2 ring-primary/15"
                  : "border-slate-200/80 bg-white/85 hover:border-slate-300 hover:bg-white"
              )}
            >
              <AdminIconArt artwork={option.artwork} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-900">
                  {option.label}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {option.caption}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface DependentFieldsBuilderProps {
  fields: DependentFieldItem[];
  onChange: (nextFields: DependentFieldItem[]) => void;
}

export function DependentFieldsBuilder({
  fields,
  onChange,
}: DependentFieldsBuilderProps) {
  function handleAddField() {
    onChange([
      ...fields,
      {
        label: "",
        type: "number",
        pricePerUnit: 500000,
        unit: "modul",
        min: 1,
        max: 50,
      },
    ]);
  }

  function handleUpdateField(
    index: number,
    patch: Partial<DependentFieldItem>
  ) {
    onChange(
      fields.map((item, idx) => (idx === index ? { ...item, ...patch } : item))
    );
  }

  function handleRemoveField(index: number) {
    onChange(fields.filter((_, idx) => idx !== index));
  }

  const serializedFields = JSON.stringify(
    fields.filter((f) => f.label.trim().length > 0)
  );

  return (
    <div className="space-y-2.5">
      <input type="hidden" name="dependentFields" value={serializedFields} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label className="text-xs font-medium">
          Parameter Skala / Input Dinamis{" "}
          <span className="text-xs font-normal text-muted-foreground">
            (Opsional)
          </span>
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddField}
          className="h-7 gap-1 bg-white px-2.5 text-xs"
        >
          <Plus className="size-3.5 text-primary" />
          <span>Tambah Input</span>
        </Button>
      </div>

      {fields.length === 0 ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-slate-200 bg-white/90 px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-slate-200/80 bg-slate-50 text-slate-500">
              <SlidersHorizontal className="size-3.5" />
            </span>
            <p className="truncate text-xs text-slate-700">
              <span className="font-semibold">Tanpa input skala tambahan</span>{" "}
              <span className="text-muted-foreground">
                — dihitung dari harga dasar
              </span>
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0 px-2 py-0 text-[11px]">
            0 parameter
          </Badge>
        </div>
      ) : (
        <div className="space-y-2.5">
          {fields.map((field, index) => (
            <div
              key={index}
              className="space-y-2.5 rounded-lg border border-slate-200/90 bg-white p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant="outline"
                  className="bg-slate-50 px-2 py-0 text-[11px] font-semibold text-slate-700"
                >
                  Input Skala #{index + 1}
                </Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveField(index)}
                  className="h-6 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="mr-1 size-3" />
                  Hapus
                </Button>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label
                    htmlFor={`dep-label-${index}`}
                    className="text-xs font-medium"
                  >
                    Label Pertanyaan Input{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`dep-label-${index}`}
                    value={field.label}
                    onChange={(e) =>
                      handleUpdateField(index, { label: e.target.value })
                    }
                    placeholder="Contoh: Jumlah Modul / Halaman Utama"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor={`dep-price-${index}`}
                    className="text-xs font-medium"
                  >
                    Biaya / Unit (IDR){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`dep-price-${index}`}
                    type="number"
                    min={0}
                    step={50000}
                    value={field.pricePerUnit}
                    onChange={(e) =>
                      handleUpdateField(index, {
                        pricePerUnit: Number(e.target.value || 0),
                      })
                    }
                    placeholder="Contoh: 750000"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor={`dep-unit-${index}`}
                    className="text-xs font-medium"
                  >
                    Satuan Unit <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id={`dep-unit-${index}`}
                    value={field.unit}
                    onChange={(e) =>
                      handleUpdateField(index, { unit: e.target.value })
                    }
                    placeholder="Contoh: modul, halaman"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
