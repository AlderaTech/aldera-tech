"use client";

import { AdminEmptyState } from "@/app/admin/_components/admin-empty-state";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Pencil,
  Plus,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { upsertProjectType, deleteProjectType } from "@/lib/actions/calculator";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { AdminIconArt } from "../../_components/admin-icon-art";
import {
  DependentFieldsBuilder,
  PROJECT_ICON_OPTIONS,
  ProjectTypeIconPicker,
  parseDependentFields,
  type DependentFieldItem,
} from "./project-type-fields";
import type { Prisma } from "@prisma/client";
import type { AdminProjectType } from "../_types/calculator-admin";

export function ProjectTypesTab({ items }: { items: AdminProjectType[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<AdminProjectType | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string>("code2");
  const [depFields, setDepFields] = useState<DependentFieldItem[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<AdminProjectType | null>(
    null
  );

  function selectEditing(target: AdminProjectType | null) {
    setEditing(target);
    setSelectedIcon(target?.icon || "code2");
    setDepFields(target ? parseDependentFields(target.dependentFields) : []);
  }

  function handleSubmit(fd: FormData) {
    const depFieldsRaw = fd.get("dependentFields") as string;
    let parsedDepFields: unknown[] = [];
    if (depFieldsRaw && depFieldsRaw.trim()) {
      try {
        parsedDepFields = JSON.parse(depFieldsRaw);
      } catch {
        toast.error("Format parameter input dinamis tidak valid");
        return;
      }
    }
    start(async () => {
      await upsertProjectType(editing?.id ?? null, {
        name: fd.get("name") as string,
        slug: fd.get("slug") as string,
        description: fd.get("description") as string,
        basePrice: Number(fd.get("basePrice")),
        icon: (fd.get("icon") as string) || selectedIcon || "code2",
        dependentFields: parsedDepFields as unknown as Prisma.InputJsonValue,
        order: Number(fd.get("order") || 0),
        active: true,
      });
      toast.success(
        editing
          ? "Jenis proyek berhasil diperbarui"
          : "Jenis proyek berhasil ditambahkan"
      );
      selectEditing(null);
      router.refresh();
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    start(async () => {
      await deleteProjectType(deleteTarget.id);
      toast.success("Jenis proyek berhasil dihapus");
      setDeleteTarget(null);
      router.refresh();
    });
  }

  const activeIconOption = PROJECT_ICON_OPTIONS.find(
    (opt) => opt.value === selectedIcon
  );

  return (
    <div className="space-y-5">
      {/* Compact Studio Form Card */}
      <Card className="gap-0 overflow-hidden border-slate-200/80 py-0 shadow-2xs">
        <form action={handleSubmit}>
          <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <AdminIconArt
                  artwork={activeIconOption?.artwork}
                  hint={`${selectedIcon} ${editing?.name || ""}`}
                  size="sm"
                />
                <div className="min-w-0 space-y-0.5">
                  <CardTitle className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                    {editing ? (
                      <>
                        <Pencil className="size-3.5 text-primary" />
                        <span>Edit Jenis Proyek</span>
                      </>
                    ) : (
                      <>
                        <Plus className="size-3.5 text-primary" />
                        <span>Tambah Jenis Proyek Baru</span>
                      </>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {editing
                      ? "Perbarui rincian, harga dasar, dan parameter skala proyek terpilih."
                      : "Tambahkan opsi jenis proyek baru yang dapat dipilih klien pada kalkulator harga."}
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {editing ? (
                  <>
                    <Badge
                      variant="outline"
                      className="border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] text-amber-800"
                    >
                      Mode Edit: {editing.name}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-muted-foreground"
                      onClick={() => selectEditing(null)}
                    >
                      <X className="mr-1 size-3.5" />
                      Batal
                    </Button>
                  </>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-600"
                  >
                    Langkah 1 Wizard
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <div className="space-y-4">
              {/* Row 1: Identitas & Harga Dasar */}
              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
                  <Label htmlFor="pt-name" className="text-xs font-medium">
                    Nama Jenis Proyek{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pt-name"
                    name="name"
                    required
                    placeholder="Contoh: Web App & SaaS"
                    defaultValue={editing?.name}
                    key={editing?.id + "-name"}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-1 lg:col-span-1">
                  <Label htmlFor="pt-slug" className="text-xs font-medium">
                    Slug URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pt-slug"
                    name="slug"
                    required
                    placeholder="Contoh: web-saas"
                    defaultValue={editing?.slug}
                    key={editing?.id + "-slug"}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-1 lg:col-span-1">
                  <Label htmlFor="pt-price" className="text-xs font-medium">
                    Harga Dasar (IDR){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pt-price"
                    name="basePrice"
                    type="number"
                    min={0}
                    step={100000}
                    required
                    placeholder="Contoh: 25000000"
                    defaultValue={editing?.basePrice}
                    key={editing?.id + "-price"}
                  />
                </div>
              </div>

              {/* Row 2: Deskripsi & Urutan */}
              <div className="grid gap-3.5 sm:grid-cols-6">
                <div className="space-y-1.5 sm:col-span-5">
                  <Label htmlFor="pt-desc" className="text-xs font-medium">
                    Deskripsi Singkat{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Opsional)
                    </span>
                  </Label>
                  <Input
                    id="pt-desc"
                    name="description"
                    placeholder="Ringkasan ruang lingkup atau target pengguna jenis proyek ini..."
                    defaultValue={editing?.description ?? ""}
                    key={editing?.id + "-desc"}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="pt-order" className="text-xs font-medium">
                    Urutan{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Opsional)
                    </span>
                  </Label>
                  <Input
                    id="pt-order"
                    name="order"
                    type="number"
                    placeholder="0"
                    defaultValue={editing?.order ?? 0}
                    key={editing?.id + "-order"}
                  />
                </div>
              </div>

              {/* Row 3: Visual & Ikon Kategori */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5">
                <ProjectTypeIconPicker
                  value={selectedIcon}
                  onChange={setSelectedIcon}
                />
              </div>

              {/* Row 4: Parameter Skala / Input Dinamis */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5">
                <DependentFieldsBuilder
                  fields={depFields}
                  onChange={setDepFields}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
            <p className="text-xs text-muted-foreground">
              Jenis proyek langsung tampil pada langkah pertama kalkulator
              publik.
            </p>
            <div className="flex items-center gap-2">
              {editing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => selectEditing(null)}
                >
                  Batal
                </Button>
              )}
              <Button type="submit" size="sm" disabled={pending}>
                {pending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                {editing ? "Simpan Perubahan" : "Tambah Jenis Proyek"}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* Compact Item List Section */}
      <div className="space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-slate-200/80 bg-white px-5 py-4 shadow-2xs">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">
              Daftar Jenis Proyek
            </h2>
            <p className="text-xs text-muted-foreground">
              Kategori layanan proyek aktif pada langkah pertama kalkulator.
            </p>
          </div>
          <Badge
            variant="outline"
            className="px-2.5 py-0.5 text-xs font-semibold"
          >
            {items.length} jenis terdaftar
          </Badge>
        </div>

        {items.length === 0 ? (
          <Card>
            <AdminEmptyState context="projectTypes" />
          </Card>
        ) : (
          <div className="grid gap-3.5 md:grid-cols-2">
            {items.map((item) => {
              const itemDepFields = parseDependentFields(item.dependentFields);
              return (
                <Card
                  key={item.id}
                  className="flex h-full flex-col justify-between gap-3.5 border-slate-200/80 p-5 transition-all hover:border-slate-300 hover:shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <AdminIconArt
                        hint={`${item.slug} ${item.name} ${item.icon || ""}`}
                        size="item"
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-sm font-semibold text-slate-900">
                            {item.name}
                          </span>
                          <Badge
                            variant="secondary"
                            className="px-2 py-0 font-mono text-[10px]"
                          >
                            {item.slug}
                          </Badge>
                        </div>
                        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {item.description ||
                            "Kategori layanan proyek digital pada wizard estimasi biaya klien."}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-8"
                        title={`Edit ${item.name}`}
                        onClick={() => {
                          selectEditing(item);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteTarget(item)}
                        title={`Hapus ${item.name}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
                    <Badge
                      variant="outline"
                      className="border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700"
                    >
                      Mulai {formatCurrency(Number(item.basePrice))}
                    </Badge>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {itemDepFields.map((df, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="gap-1 px-2 py-0 text-[10px] font-medium"
                        >
                          <SlidersHorizontal className="size-3 text-primary" />
                          <span>
                            +{formatCurrency(df.pricePerUnit)}/{df.unit}
                          </span>
                        </Badge>
                      ))}
                      <Badge
                        variant="outline"
                        className="bg-slate-50 px-2 py-0 text-[10px] text-muted-foreground"
                      >
                        #{item.order}
                      </Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Jenis Proyek"
        description={`Apakah Anda yakin ingin menghapus jenis proyek "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        destructive
        pending={pending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
