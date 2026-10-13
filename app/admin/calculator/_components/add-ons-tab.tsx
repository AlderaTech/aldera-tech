"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { upsertAddOnOption, deleteAddOnOption } from "@/lib/actions/calculator";
import type { AdminAddOn } from "../_types/calculator-admin";

export function AddOnsTab({ items }: { items: AdminAddOn[] }) {
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<AdminAddOn | null>(null);

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
      toast.success(editing ? "Diperbarui" : "Ditambahkan");
      setEditing(null);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Hapus add-on ini?")) return;
    start(async () => {
      await deleteAddOnOption(id);
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
            <Label>Harga/Bulan</Label>
            <Input
              name="pricePerMonth"
              type="number"
              required
              defaultValue={editing?.pricePerMonth}
              key={editing?.id + "p"}
            />
          </div>
          <div>
            <Label>Min Bulan</Label>
            <Input
              name="minMonths"
              type="number"
              defaultValue={editing?.minMonths || 1}
              key={editing?.id + "min"}
            />
          </div>
          <div>
            <Label>Max Bulan</Label>
            <Input
              name="maxMonths"
              type="number"
              defaultValue={editing?.maxMonths || 12}
              key={editing?.id + "max"}
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
          <div className="sm:col-span-2 lg:col-span-3">
            <Label>Deskripsi</Label>
            <Input
              name="description"
              defaultValue={editing?.description ?? ""}
              key={editing?.id + "d"}
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
                <Badge variant="secondary">
                  {formatCurrency(Number(item.pricePerMonth))}/bulan
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {item.minMonths}-{item.maxMonths} bulan •{" "}
                {item.description || "-"}
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
