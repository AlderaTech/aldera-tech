"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  upsertFeatureOption,
  deleteFeatureOption,
} from "@/lib/actions/calculator";
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
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<AdminFeature | null>(null);

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
      toast.success(editing ? "Diperbarui" : "Ditambahkan");
      setEditing(null);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Hapus fitur ini?")) return;
    start(async () => {
      await deleteFeatureOption(id);
      toast.success("Dihapus");
    });
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <form
          action={handleSubmit}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
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
            <Label>Harga</Label>
            <Input
              name="price"
              type="number"
              required
              defaultValue={editing?.price}
              key={editing?.id + "p"}
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
          <div>
            <Label>Deskripsi</Label>
            <Input
              name="description"
              defaultValue={editing?.description ?? ""}
              key={editing?.id + "d"}
            />
          </div>
          <div>
            <Label>Jenis Proyek (opsional)</Label>
            <select
              name="projectTypeId"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              defaultValue={editing?.projectTypeId || ""}
              key={editing?.id + "pt"}
            >
              <option value="">Semua</option>
              {projectTypes.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="isMajor"
                defaultChecked={editing?.isMajor}
                key={editing?.id + "m"}
              />{" "}
              Major
            </label>
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <Label>Disclaimer</Label>
            <Textarea
              name="disclaimer"
              rows={2}
              defaultValue={editing?.disclaimer ?? ""}
              key={editing?.id + "dis"}
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
              <div className="flex items-center gap-2 font-medium">
                {item.name}
                {item.isMajor && (
                  <Badge className="bg-amber-500 text-white">
                    <Star className="size-3" /> Major
                  </Badge>
                )}
                <Badge variant="secondary">
                  {formatCurrency(Number(item.price))}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {item.projectType?.name || "Semua"} • {item.description || "-"}
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
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
