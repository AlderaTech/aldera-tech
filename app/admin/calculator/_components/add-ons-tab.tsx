"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, PackagePlus, Pencil, Plus, Trash2, X } from "lucide-react";
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
import { upsertAddOnOption, deleteAddOnOption } from "@/lib/actions/calculator";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { AdminIconArt } from "../../_components/admin-icon-art";
import type { AdminAddOn } from "../_types/calculator-admin";

export function AddOnsTab({ items }: { items: AdminAddOn[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<AdminAddOn | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminAddOn | null>(null);

  function handleSubmit(fd: FormData) {
    start(async () => {
      await upsertAddOnOption(editing?.id ?? null, {
        name: fd.get("name") as string,
        description: (fd.get("description") as string) || undefined,
        pricePerMonth: Number(fd.get("pricePerMonth")),
        minMonths: Number(fd.get("minMonths") || 1),
        maxMonths: Number(fd.get("maxMonths") || 12),
        order: Number(fd.get("order") || 0),
        active: true,
      });
      toast.success(
        editing ? "Add-on berhasil diperbarui" : "Add-on berhasil ditambahkan"
      );
      setEditing(null);
      router.refresh();
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    start(async () => {
      await deleteAddOnOption(deleteTarget.id);
      toast.success("Add-on berhasil dihapus");
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {/* Compact Studio Form Card */}
      <Card className="gap-0 overflow-hidden border-slate-200/80 py-0 shadow-2xs">
        <form action={handleSubmit}>
          <CardHeader className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <AdminIconArt
                  artwork="service-cloud"
                  hint={editing?.name || "Opsi Add-On"}
                  size="sm"
                />
                <div className="min-w-0 space-y-0.5">
                  <CardTitle className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                    {editing ? (
                      <>
                        <Pencil className="size-3.5 text-primary" />
                        <span>Edit Add-On / Retainer</span>
                      </>
                    ) : (
                      <>
                        <Plus className="size-3.5 text-primary" />
                        <span>Tambah Add-On Baru</span>
                      </>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {editing
                      ? "Perbarui tarif bulanan, durasi kontrak, dan deskripsi opsi add-on terpilih."
                      : "Tambahkan paket langganan retainer atau layanan pemeliharaan berkala pada kalkulator."}
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
                    Langkah 4 Wizard
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-5">
            <div className="space-y-4">
              {/* Row 1: Nama & Biaya Bulanan */}
              <div className="grid gap-3.5 sm:grid-cols-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="addon-name" className="text-xs font-medium">
                    Nama Add-On <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="addon-name"
                    name="name"
                    required
                    placeholder="Contoh: SLA & Maintenance Rutin Bulanan"
                    defaultValue={editing?.name}
                    key={editing?.id + "-name"}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="addon-price" className="text-xs font-medium">
                    Biaya per Bulan (IDR){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="addon-price"
                    name="pricePerMonth"
                    type="number"
                    min={0}
                    step={50000}
                    required
                    placeholder="Contoh: 1500000"
                    defaultValue={editing?.pricePerMonth}
                    key={editing?.id + "-price"}
                  />
                </div>
              </div>

              {/* Row 2: Deskripsi, Min/Max Bulan & Urutan */}
              <div className="grid gap-3.5 sm:grid-cols-6">
                <div className="space-y-1.5 sm:col-span-3">
                  <Label htmlFor="addon-desc" className="text-xs font-medium">
                    Deskripsi Layanan{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Opsional)
                    </span>
                  </Label>
                  <Input
                    id="addon-desc"
                    name="description"
                    placeholder="Rincian cakupan paket retainer atau layanan garansi berkala..."
                    defaultValue={editing?.description ?? ""}
                    key={editing?.id + "-desc"}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="addon-min" className="text-xs font-medium">
                    Min. Bulan{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Opsional)
                    </span>
                  </Label>
                  <Input
                    id="addon-min"
                    name="minMonths"
                    type="number"
                    min={1}
                    placeholder="1"
                    defaultValue={editing?.minMonths ?? 1}
                    key={editing?.id + "-min"}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="addon-max" className="text-xs font-medium">
                    Maks. Bulan{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Opsional)
                    </span>
                  </Label>
                  <Input
                    id="addon-max"
                    name="maxMonths"
                    type="number"
                    min={1}
                    placeholder="12"
                    defaultValue={editing?.maxMonths ?? 12}
                    key={editing?.id + "-max"}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-1">
                  <Label htmlFor="addon-order" className="text-xs font-medium">
                    Urutan{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Opsional)
                    </span>
                  </Label>
                  <Input
                    id="addon-order"
                    name="order"
                    type="number"
                    placeholder="0"
                    defaultValue={editing?.order ?? 0}
                    key={editing?.id + "-order"}
                  />
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
            <p className="text-xs text-muted-foreground">
              Biaya add-on dikalikan dengan jumlah bulan yang dipilih klien.
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
                {editing ? "Simpan Perubahan" : "Tambah Add-On"}
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
              Daftar Opsi Add-On & Retainer
            </h2>
            <p className="text-xs text-muted-foreground">
              Paket retainer bulanan yang dapat dipilih klien pada langkah
              add-on.
            </p>
          </div>
          <Badge
            variant="outline"
            className="px-2.5 py-0.5 text-xs font-semibold"
          >
            {items.length} opsi terdaftar
          </Badge>
        </div>

        {items.length === 0 ? (
          <Card className="flex flex-col items-center justify-center border-dashed p-8 text-center">
            <div className="mb-2.5 flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <PackagePlus className="size-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              Belum ada opsi add-on
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Tambahkan paket add-on atau pemeliharaan pertama menggunakan
              formulir di atas.
            </p>
          </Card>
        ) : (
          <div className="grid gap-3.5 md:grid-cols-2">
            {items.map((item) => (
              <Card
                key={item.id}
                className="flex h-full flex-col justify-between gap-3.5 border-slate-200/80 p-5 transition-all hover:border-slate-300 hover:shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <AdminIconArt
                      hint={`${item.name} ${item.description || ""}`}
                      size="item"
                    />
                    <div className="min-w-0 space-y-1">
                      <span className="block text-sm font-semibold text-slate-900">
                        {item.name}
                      </span>
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {item.description ||
                          "Paket pemeliharaan berkala, pemantauan server, dan dukungan teknis pasca-rilis."}
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
                    className="border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700"
                  >
                    {formatCurrency(Number(item.pricePerMonth))}/bulan
                  </Badge>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="secondary"
                      className="px-2 py-0 text-[10px] font-normal"
                    >
                      Durasi: {item.minMonths}-{item.maxMonths} bln
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
        title="Hapus Add-on"
        description={`Apakah Anda yakin ingin menghapus add-on "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        destructive
        pending={pending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
