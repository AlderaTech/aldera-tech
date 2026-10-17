"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CalendarClock,
  Loader2,
  PackagePlus,
  Pencil,
  Plus,
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
import { upsertAddOnOption, deleteAddOnOption } from "@/lib/actions/calculator";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
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
                      <span>Edit Add-On / Retainer</span>
                    </>
                  ) : (
                    <>
                      <Plus className="size-4 text-primary" />
                      <span>Tambah Add-On Baru</span>
                    </>
                  )}
                </CardTitle>
                <CardDescription className="mt-0.5 text-xs text-muted-foreground">
                  {editing
                    ? "Perbarui tarif bulanan, durasi kontrak, dan deskripsi opsi add-on terpilih."
                    : "Tambahkan paket langganan retainer atau layanan pemeliharaan berkala pada kalkulator."}
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

              <div className="space-y-1.5">
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

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="addon-min" className="text-xs font-medium">
                  Minimal Durasi (Bulan){" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (opsional)
                  </span>
                </Label>
                <Input
                  id="addon-min"
                  name="minMonths"
                  type="number"
                  min={1}
                  placeholder="Contoh: 1"
                  defaultValue={editing?.minMonths ?? 1}
                  key={editing?.id + "-min"}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addon-max" className="text-xs font-medium">
                  Maksimal Durasi (Bulan){" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (opsional)
                  </span>
                </Label>
                <Input
                  id="addon-max"
                  name="maxMonths"
                  type="number"
                  min={1}
                  placeholder="Contoh: 12"
                  defaultValue={editing?.maxMonths ?? 12}
                  key={editing?.id + "-max"}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addon-order" className="text-xs font-medium">
                  Urutan Tampilan{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (opsional)
                  </span>
                </Label>
                <Input
                  id="addon-order"
                  name="order"
                  type="number"
                  placeholder="Contoh: 1"
                  defaultValue={editing?.order ?? 0}
                  key={editing?.id + "-order"}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="addon-desc" className="text-xs font-medium">
                Deskripsi Layanan{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (opsional)
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
              {editing ? "Simpan Perubahan" : "Tambah Add-On"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Item List Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">
              Daftar Opsi Add-On & Retainer
            </h2>
            <p className="text-xs text-muted-foreground">
              Paket retainer bulanan yang dapat dipilih klien pada langkah
              add-on.
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-medium">
            {items.length} opsi terdaftar
          </Badge>
        </div>

        {items.length === 0 ? (
          <Card className="flex flex-col items-center justify-center border-dashed p-8 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <PackagePlus className="size-6" />
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
          <div className="grid gap-3">
            {items.map((item) => (
              <Card
                key={item.id}
                className="p-4 transition-all hover:border-slate-300 hover:shadow-xs"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3.5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                      <CalendarClock className="size-5" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {item.name}
                        </span>

                        <Badge
                          variant="outline"
                          className="border-sky-200 bg-sky-50 text-xs font-semibold text-sky-700"
                        >
                          {formatCurrency(Number(item.pricePerMonth))}/bulan
                        </Badge>

                        <Badge
                          variant="secondary"
                          className="text-[11px] font-normal"
                        >
                          Durasi: {item.minMonths} - {item.maxMonths} Bulan
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
                      title="Hapus add-on"
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
