"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Code2,
  FolderKanban,
  Loader2,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { upsertProjectType, deleteProjectType } from "@/lib/actions/calculator";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { Prisma } from "@prisma/client";
import type { AdminProjectType } from "../_types/calculator-admin";

export function ProjectTypesTab({ items }: { items: AdminProjectType[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<AdminProjectType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProjectType | null>(
    null
  );

  function handleSubmit(fd: FormData) {
    const depFields = fd.get("dependentFields") as string;
    let parsedDepFields: unknown[] = [];
    if (depFields && depFields.trim()) {
      try {
        parsedDepFields = JSON.parse(depFields);
      } catch {
        toast.error("Format JSON dependent fields tidak valid");
        return;
      }
    }
    start(async () => {
      await upsertProjectType(editing?.id ?? null, {
        name: fd.get("name") as string,
        slug: fd.get("slug") as string,
        description: fd.get("description") as string,
        basePrice: Number(fd.get("basePrice")),
        icon: (fd.get("icon") as string) || "code2",
        dependentFields: parsedDepFields as unknown as Prisma.InputJsonValue,
        order: Number(fd.get("order") || 0),
        active: true,
      });
      toast.success(
        editing
          ? "Jenis proyek berhasil diperbarui"
          : "Jenis proyek berhasil ditambahkan"
      );
      setEditing(null);
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
                      <span>Edit Jenis Proyek</span>
                    </>
                  ) : (
                    <>
                      <Plus className="size-4 text-primary" />
                      <span>Tambah Jenis Proyek Baru</span>
                    </>
                  )}
                </CardTitle>
                <CardDescription className="mt-0.5 text-xs text-muted-foreground">
                  {editing
                    ? "Perbarui rincian, harga dasar, dan formulir jenis proyek terpilih."
                    : "Tambahkan opsi jenis proyek baru yang dapat dipilih klien pada kalkulator harga."}
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
                <Label htmlFor="pt-name" className="text-xs font-medium">
                  Nama Jenis Proyek <span className="text-destructive">*</span>
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

              <div className="space-y-1.5">
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
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="pt-price" className="text-xs font-medium">
                  Harga Dasar (IDR) <span className="text-destructive">*</span>
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

              <div className="space-y-1.5">
                <Label htmlFor="pt-icon" className="text-xs font-medium">
                  Nama Icon{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (opsional)
                  </span>
                </Label>
                <Input
                  id="pt-icon"
                  name="icon"
                  placeholder="Contoh: code2, smartphone, globe"
                  defaultValue={editing?.icon || "code2"}
                  key={editing?.id + "-icon"}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pt-order" className="text-xs font-medium">
                  Urutan Tampilan{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (opsional)
                  </span>
                </Label>
                <Input
                  id="pt-order"
                  name="order"
                  type="number"
                  placeholder="Contoh: 1"
                  defaultValue={editing?.order ?? 0}
                  key={editing?.id + "-order"}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pt-desc" className="text-xs font-medium">
                Deskripsi Singkat{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (opsional)
                </span>
              </Label>
              <Textarea
                id="pt-desc"
                name="description"
                rows={2}
                placeholder="Ringkasan ruang lingkup atau target pengguna jenis proyek ini..."
                defaultValue={editing?.description ?? ""}
                key={editing?.id + "-desc"}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="pt-dep" className="text-xs font-medium">
                  Dependent Fields (JSON Schema){" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (opsional)
                  </span>
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  Array konfigurasi input dinamis
                </span>
              </div>
              <Textarea
                id="pt-dep"
                name="dependentFields"
                rows={3}
                placeholder={`[\n  {\n    "name": "pages",\n    "label": "Jumlah Halaman",\n    "type": "number",\n    "pricePerUnit": 500000\n  }\n]`}
                defaultValue={
                  editing?.dependentFields
                    ? JSON.stringify(editing.dependentFields, null, 2)
                    : "[]"
                }
                key={editing?.id + "-dep"}
                className="font-mono text-xs"
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
              {editing ? "Simpan Perubahan" : "Tambah Jenis Proyek"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Item List Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-slate-900">
              Daftar Jenis Proyek
            </h2>
            <p className="text-xs text-muted-foreground">
              Kategori proyek aktif yang ditampilkan pada wizard kalkulator
              harga.
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-medium">
            {items.length} jenis terdaftar
          </Badge>
        </div>

        {items.length === 0 ? (
          <Card className="flex flex-col items-center justify-center border-dashed p-8 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FolderKanban className="size-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              Belum ada jenis proyek
            </h3>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Tambahkan jenis proyek pertama Anda menggunakan formulir di atas
              untuk mengaktifkannya di kalkulator publik.
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
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Code2 className="size-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {item.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className="font-mono text-[11px]"
                        >
                          {item.slug}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-700"
                        >
                          {formatCurrency(Number(item.basePrice))}
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

                      {Array.isArray(item.dependentFields) &&
                        (item.dependentFields as unknown[]).length > 0 && (
                          <div className="flex items-center gap-1.5 pt-0.5 text-[11px] text-slate-500">
                            <span className="inline-block size-1.5 rounded-full bg-primary" />
                            <span>
                              {(item.dependentFields as unknown[]).length}{" "}
                              Dependent Field(s) terkonfigurasi
                            </span>
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
                      title="Hapus jenis proyek"
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
