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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  upsertFeatureOption,
  deleteFeatureOption,
} from "@/lib/actions/calculator";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
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
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<AdminFeature | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminFeature | null>(null);
  const [selectedProjectTypeFilter, setSelectedProjectTypeFilter] =
    useState<string>("ALL");

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
    <div className="space-y-6">
      {/* Form Card */}
      <Card className="border-slate-200/80 shadow-xs">
        <form action={handleSubmit}>
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  {editing ? (
                    <>
                      <Pencil className="size-4 text-primary" />
                      <span>Edit Fitur Kalkulator</span>
                    </>
                  ) : (
                    <>
                      <Plus className="size-4 text-primary" />
                      <span>Tambah Fitur Baru</span>
                    </>
                  )}
                </CardTitle>
                <CardDescription className="mt-0.5 text-xs text-muted-foreground">
                  {editing
                    ? "Perbarui harga, cakupan, dan asosiasi jenis proyek untuk fitur ini."
                    : "Tambahkan item modul fitur yang dapat dipilih klien saat merancang proyek."}
                </CardDescription>
              </div>
              {editing && (
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-amber-300 bg-amber-50 text-xs text-amber-800"
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
                    <X className="mr-1 size-3" />
                    Batal
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
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

              <div className="space-y-1.5">
                <Label htmlFor="feat-price" className="text-xs font-medium">
                  Harga Fitur (IDR) <span className="text-destructive">*</span>
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
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="feat-pt" className="text-xs font-medium">
                  Khusus Jenis Proyek{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (opsional)
                  </span>
                </Label>
                <select
                  id="feat-pt"
                  name="projectTypeId"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-xs focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
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

              <div className="space-y-1.5">
                <Label htmlFor="feat-order" className="text-xs font-medium">
                  Urutan Tampilan{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (opsional)
                  </span>
                </Label>
                <Input
                  id="feat-order"
                  name="order"
                  type="number"
                  placeholder="Contoh: 1"
                  defaultValue={editing?.order ?? 0}
                  key={editing?.id + "-order"}
                />
              </div>

              <div className="flex flex-col justify-end">
                <div className="flex h-9 items-center rounded-md border border-slate-200 bg-slate-50/50 px-3">
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-800">
                    <input
                      type="checkbox"
                      name="isMajor"
                      className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                      defaultChecked={editing?.isMajor}
                      key={editing?.id + "-major"}
                    />
                    <Star className="size-3.5 fill-amber-500 text-amber-500" />
                    <span>Tandai sebagai Fitur Utama (Major)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="feat-desc" className="text-xs font-medium">
                Deskripsi Fitur{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (opsional)
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

            <div className="space-y-1.5">
              <Label htmlFor="feat-disclaimer" className="text-xs font-medium">
                Catatan Teknis / Disclaimer{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (opsional)
                </span>
              </Label>
              <Textarea
                id="feat-disclaimer"
                name="disclaimer"
                rows={2}
                placeholder="Contoh: Memerlukan akun merchant Midtrans / Xendit aktif dan verifikasi legalitas bisnis..."
                defaultValue={editing?.disclaimer ?? ""}
                key={editing?.id + "-dis"}
              />
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-3.5">
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
          </CardFooter>
        </form>
      </Card>

      {/* Item List Section */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
              onChange={(e) => setSelectedProjectTypeFilter(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2.5 py-0.5 text-xs text-foreground shadow-xs"
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
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Sparkles className="size-6" />
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
          <div className="grid gap-3">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="p-4 transition-all hover:border-slate-300 hover:shadow-xs"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3.5">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                        item.isMajor
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.isMajor ? (
                        <Star className="size-5 fill-amber-500 text-amber-500" />
                      ) : (
                        <Sparkles className="size-5" />
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {item.name}
                        </span>

                        {item.isMajor && (
                          <Badge className="border-amber-300 bg-amber-500 text-[11px] font-medium text-white">
                            <Star className="mr-1 size-3 fill-white" /> Major
                          </Badge>
                        )}

                        <Badge
                          variant="outline"
                          className="border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-700"
                        >
                          {formatCurrency(Number(item.price))}
                        </Badge>

                        <Badge
                          variant="secondary"
                          className="text-[11px] font-normal"
                        >
                          {item.projectType?.name || "Semua Proyek"}
                        </Badge>

                        <Badge
                          variant="outline"
                          className="text-[11px] text-muted-foreground"
                        >
                          Urutan: #{item.order}
                        </Badge>
                      </div>

                      {item.description && (
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      )}

                      {item.disclaimer && (
                        <div className="inline-block rounded border border-slate-200/60 bg-slate-50 px-2 py-1 text-[11px] text-slate-600">
                          <span className="font-medium text-slate-700">
                            Catatan:
                          </span>{" "}
                          {item.disclaimer}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => {
                        setEditing(item);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      <Pencil className="size-3.5" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDeleteTarget(item)}
                      title="Hapus fitur"
                    >
                      <Trash2 className="size-4" />
                    </Button>
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
