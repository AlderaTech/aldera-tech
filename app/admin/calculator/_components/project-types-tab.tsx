"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { upsertProjectType, deleteProjectType } from "@/lib/actions/calculator";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import type { AdminProjectType } from "../_types/calculator-admin";

export function ProjectTypesTab({ items }: { items: AdminProjectType[] }) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<AdminProjectType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProjectType | null>(null);

  function handleSubmit(fd: FormData) {
    const depFields = fd.get("dependentFields") as string;
    start(async () => {
      await upsertProjectType(editing?.id ?? null, {
        name: fd.get("name") as string,
        slug: fd.get("slug") as string,
        description: fd.get("description") as string,
        basePrice: Number(fd.get("basePrice")),
        icon: (fd.get("icon") as string) || "code2",
        dependentFields: depFields ? JSON.parse(depFields) : [],
        order: Number(fd.get("order") || 0),
        active: true,
      });
      toast.success(editing ? "Diperbarui" : "Ditambahkan");
      setEditing(null);
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    start(async () => {
      await deleteProjectType(deleteTarget.id);
      toast.success("Dihapus");
      setDeleteTarget(null);
    });
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <form
          action={handleSubmit}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div>
            <Label>Nama</Label>
            <Input
              name="name"
              required
              defaultValue={editing?.name}
              key={editing?.id + "n"}
            />
          </div>
          <div>
            <Label>Slug</Label>
            <Input
              name="slug"
              required
              defaultValue={editing?.slug}
              key={editing?.id + "s"}
            />
          </div>
          <div>
            <Label>Base Price</Label>
            <Input
              name="basePrice"
              type="number"
              required
              defaultValue={editing?.basePrice}
              key={editing?.id + "p"}
            />
          </div>
          <div>
            <Label>Icon</Label>
            <Input
              name="icon"
              defaultValue={editing?.icon || "code2"}
              key={editing?.id + "i"}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Deskripsi</Label>
            <Input
              name="description"
              defaultValue={editing?.description ?? ""}
              key={editing?.id + "d"}
            />
          </div>
          <div>
            <Label>Order</Label>
            <Input
              name="order"
              type="number"
              defaultValue={editing?.order || 0}
              key={editing?.id + "o"}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <Label>Dependent Fields (JSON)</Label>
            <Textarea
              name="dependentFields"
              rows={3}
              defaultValue={
                editing?.dependentFields
                  ? JSON.stringify(editing.dependentFields, null, 2)
                  : "[]"
              }
              key={editing?.id + "df"}
              className="font-mono text-xs"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              {editing ? "Update" : "Tambah"}
            </Button>
            {editing && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditing(null)}
              >
                Batal
              </Button>
            )}
          </div>
        </form>
      </Card>
      <div className="space-y-2">
        {items.map((item) => (
          <Card
            key={item.id}
            className="flex items-center justify-between gap-4 p-4"
          >
            <div>
              <div className="font-medium">
                {item.name}{" "}
                <Badge variant="secondary" className="ml-2">
                  {formatCurrency(Number(item.basePrice))}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {item.slug} • {item.description}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(item)}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDeleteTarget(item)}
                className="cursor-pointer text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </Card>
        ))}
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
