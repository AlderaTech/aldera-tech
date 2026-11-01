"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Filter,
  Loader2,
  Pencil,
  Plus,
  Sparkles,
  Star,
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
import {
  upsertFeatureOption,
  deleteFeatureOption,
} from "@/lib/actions/calculator";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useUrlState } from "@/lib/hooks/use-url-state";
import { AdminIconArt } from "../../_components/admin-icon-art";
import type {
  AdminFeature,
  AdminProjectType,
} from "../_types/calculator-admin";

export function FeaturesTab({
  items,
  projectTypes,
}: {
  items: AdminFeature[];
  projectTypes: AdminProjectType[];
}) {
  const router = useRouter();
  const { getParam, setParam } = useUrlState();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<AdminFeature | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminFeature | null>(null);
  const selectedProjectTypeFilter = getParam("projectType", "ALL");

  const filteredItems = useMemo(() => {
    if (selectedProjectTypeFilter === "ALL") return items;
    if (selectedProjectTypeFilter === "GLOBAL")
      return items.filter((f) => !f.projectTypeId);
    return items.filter((f) => f.projectTypeId === selectedProjectTypeFilter);
  }, [items, selectedProjectTypeFilter]);

  function handleSubmit(fd: FormData) {
    start(async () => {
      await upsertFeatureOption(editing?.id ?? null, {
        name: fd.get("name") as string,
        description: (fd.get("description") as string) || undefined,
        price: Number(fd.get("price")),
        isMajor: fd.get("isMajor") === "on",
        disclaimer: (fd.get("disclaimer") as string) || undefined,
        projectTypeId: (fd.get("projectTypeId") as string) || null,
        order: Number(fd.get("order") || 0),
        active: true,
      });
      toast.success(
        editing ? "Fitur berhasil diperbarui" : "Fitur berhasil ditambahkan"
      );
      setEditing(null);
      router.refresh();
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    start(async () => {
      await deleteFeatureOption(deleteTarget.id);
      toast.success("Fitur berhasil dihapus");
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {/* Compact Studio Form Card */}
      <Card className="gap-0 overflow-hidden border-slate-200/80 py-0 shadow-2xs">
        <form action={handleSubmit}>
          <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-5 py-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <AdminIconArt
                  artwork="service-ai"
                  hint={editing?.name || "Fitur Kalkulator"}
                  size="sm"
                />
                <div className="min-w-0 space-y-0.5">
                  <CardTitle className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                    {editing ? (
                      <>
                        <Pencil className="size-3.5 text-primary" />
                        <span>Edit Fitur Kalkulator</span>
                      </>
                    ) : (
                      <>
                        <Plus className="size-3.5 text-primary" />
                        <span>Tambah Fitur Baru</span>
                      </>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {editing
                      ? "Perbarui harga, cakupan, dan asosiasi jenis proyek untuk fitur ini."
                      : "Tambahkan item modul fitur yang dapat dipilih klien saat merancang proyek."}
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
                      onClick={() => setEditing(null)}
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
                    Langkah 3 Wizard
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <div className="space-y-4">
              {/* Row 1: Nama, Harga & Relasi Jenis Proyek */}
              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
                  <Label htmlFor="feat-name" className="text-xs font-medium">
                    Nama Fitur <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="feat-name"
                    name="name"
                    required
                    placeholder="Contoh: Payment Gateway & Split Payment"
                    defaultValue={editing?.name}
                    key={editing?.id + "-name"}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-1 lg:col-span-1">
                  <Label htmlFor="feat-price" className="text-xs font-medium">
                    Harga Fitur (IDR){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="feat-price"
                    name="price"
                    type="number"
                    min={0}
                    step={50000}
                    required
                    placeholder="Contoh: 5000000"
                    defaultValue={editing?.price}
                    key={editing?.id + "-price"}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-1 lg:col-span-1">
                  <Label htmlFor="feat-pt" className="text-xs font-medium">
                    Khusus Jenis Proyek{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Opsional)
                    </span>
                  </Label>
                  <select
                    id="feat-pt"
                    name="projectTypeId"
                    className="flex h-9.5 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs text-foreground shadow-2xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                    defaultValue={editing?.projectTypeId || ""}
                    key={editing?.id + "-pt"}
                  >
                    <option value="">Semua Jenis Proyek (Global)</option>
                    {projectTypes.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Deskripsi & Urutan */}
              <div className="grid gap-3.5 sm:grid-cols-6">
                <div className="space-y-1.5 sm:col-span-5">
                  <Label htmlFor="feat-desc" className="text-xs font-medium">
                    Deskripsi Fitur{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Opsional)
                    </span>
                  </Label>
                  <Input
                    id="feat-desc"
                    name="description"
                    placeholder="Penjelasan ringkas fungsi dan ruang lingkup teknis modul fitur..."
                    defaultValue={editing?.description ?? ""}
                    key={editing?.id + "-desc"}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="feat-order" className="text-xs font-medium">
                    Urutan{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Opsional)
                    </span>
                  </Label>
                  <Input
                    id="feat-order"
                    name="order"
                    type="number"
                    placeholder="0"
                    defaultValue={editing?.order ?? 0}
                    key={editing?.id + "-order"}
                  />
                </div>
              </div>

              {/* Row 3: Klasifikasi Major & Catatan Teknis */}
              <div className="grid gap-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 sm:grid-cols-2">
                <div className="flex items-center rounded-lg border border-slate-200/80 bg-white p-3">
                  <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-slate-800">
                    <input
                      type="checkbox"
                      name="isMajor"
                      className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                      defaultChecked={editing?.isMajor}
                      key={editing?.id + "-major"}
                    />
                    <Star className="size-3.5 shrink-0 fill-amber-500 text-amber-500" />
                    <div>
                      <span className="block font-semibold text-slate-900">
                        Tandai sebagai Fitur Utama (Major)
                      </span>
                      <span className="block text-[11px] font-normal text-muted-foreground">
                        Menampilkan badge sorotan prioritas pada kalkulator.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="feat-disclaimer"
                    className="text-xs font-medium"
                  >
                    Catatan Teknis / Disclaimer{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Opsional)
                    </span>
                  </Label>
                  <Input
                    id="feat-disclaimer"
                    name="disclaimer"
                    placeholder="Contoh: Memerlukan akun merchant Midtrans / Xendit aktif..."
                    defaultValue={editing?.disclaimer ?? ""}
                    key={editing?.id + "-dis"}
                  />
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
            <p className="text-xs text-muted-foreground">
              Fitur global tampil di semua proyek; fitur khusus hanya tampil
              sesuai asosiasi proyek.
            </p>
            <div className="flex items-center gap-2">
              {editing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(null)}
                >
                  Batal
                </Button>
              )}
              <Button type="submit" size="sm" disabled={pending}>
                {pending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                {editing ? "Simpan Perubahan" : "Tambah Fitur"}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>

      {/* Compact Item List Section */}
      <div className="space-y-3.5">
        <div className="flex flex-col gap-2.5 rounded-xl border border-slate-200/80 bg-white px-5 py-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">
              Daftar Fitur Tambahan
            </h2>
            <p className="text-xs text-muted-foreground">
              Fitur yang dapat dipilih klien pada langkah pemilihan fitur
              kalkulator.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter className="size-3.5" />
              <span>Filter:</span>
            </div>
            <select
              value={selectedProjectTypeFilter}
              onChange={(e) => setParam("projectType", e.target.value)}
              className="h-8.5 rounded-md border border-input bg-background px-2.5 py-1 text-xs text-foreground shadow-2xs"
            >
              <option value="ALL">Semua ({items.length})</option>
              <option value="GLOBAL">
                Global ({items.filter((i) => !i.projectTypeId).length})
              </option>
              {projectTypes.map((pt) => {
                const count = items.filter(
                  (i) => i.projectTypeId === pt.id
                ).length;
                return (
                  <option key={pt.id} value={pt.id}>
                    {pt.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <Card className="flex flex-col items-center justify-center border-dashed p-8 text-center">
            <div className="mb-2.5 flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Sparkles className="size-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              Belum ada fitur untuk kategori ini
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Tambahkan fitur baru menggunakan formulir di atas untuk
              menampilkannya di kalkulator.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3.5 md:grid-cols-2">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="flex h-full flex-col justify-between gap-3.5 border-slate-200/80 p-5 transition-all hover:border-slate-300 hover:shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <AdminIconArt
                      hint={`${item.name} ${item.description || ""} ${item.projectType?.name || ""}`}
                      size="item"
                    />

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-semibold text-slate-900">
                          {item.name}
                        </span>
                        {item.isMajor && (
                          <Badge className="border-amber-300 bg-amber-500 px-2 py-0 text-[10px] font-medium text-white">
                            <Star className="mr-0.5 size-2.5 fill-white" />{" "}
                            Major
                          </Badge>
                        )}
                      </div>
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {item.description ||
                          "Modul fitur fungsional yang dapat dipilih klien saat konfigurasi proyek."}
                      </p>
                      {item.disclaimer && (
                        <p className="line-clamp-1 text-[11px] text-slate-500">
                          <span className="font-medium text-slate-700">
                            Catatan:
                          </span>{" "}
                          {item.disclaimer}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      size="icon"
                      variant="outline"
                      className="size-8"
                      title={`Edit ${item.name}`}
                      onClick={() => {
                        setEditing(item);
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
                    {formatCurrency(Number(item.price))}
                  </Badge>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="secondary"
                      className="px-2 py-0 text-[10px] font-normal"
                    >
                      {item.projectType?.name || "Semua Proyek"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-slate-50 px-2 py-0 text-[10px] text-muted-foreground"
                    >
                      #{item.order}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Fitur"
        description={`Apakah Anda yakin ingin menghapus fitur "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        destructive
        pending={pending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
