"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminFieldLabel as Label } from "../../../_components/admin-field-label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createRecurringTemplateAction } from "@/lib/actions/recurring-invoice";
import { ADMIN_ROUTES } from "@/lib/routes";
import { formatCurrency } from "@/lib/utils";

type Client = { id: string; name: string; email: string };
type Project = { id: string; title: string; clientId: string };
type Item = { description: string; quantity: string; price: string };

export function RecurringTemplateForm({
  clients,
  projects,
}: {
  clients: Client[];
  projects: Project[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [nextIssueDate, setNextIssueDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [dueDays, setDueDays] = useState("14");
  const [taxRate, setTaxRate] = useState("11");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Item[]>([
    { description: "", quantity: "1", price: "0" },
  ]);
  const [isPending, startTransition] = useTransition();

  const filteredProjects = projects.filter((p) => p.clientId === clientId);
  const subtotal = items.reduce(
    (s, it) => s + (Number(it.quantity) || 0) * (Number(it.price) || 0),
    0
  );
  const total = subtotal + (subtotal * (Number(taxRate) || 0)) / 100;

  function updateItem(i: number, patch: Partial<Item>) {
    setItems((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it))
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("name", name);
    fd.set("clientId", clientId);
    fd.set("projectId", projectId);
    fd.set("frequency", frequency);
    fd.set("nextIssueDate", nextIssueDate);
    fd.set("dueDays", dueDays);
    fd.set("taxRate", taxRate);
    fd.set("notes", notes);
    fd.set(
      "items",
      JSON.stringify(
        items.map((it) => ({
          description: it.description,
          quantity: Number(it.quantity),
          price: Number(it.price),
        }))
      )
    );
    startTransition(async () => {
      const r = await createRecurringTemplateAction(fd);
      if (r.ok) {
        toast.success(r.message ?? "Template dibuat");
        router.push(ADMIN_ROUTES.invoicesRecurring);
        router.refresh();
      } else {
        toast.error(r.message ?? "Gagal");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      <Card className="space-y-5 p-6">
        <div className="space-y-2">
          <Label htmlFor="name" required>
            Nama Template
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Misal: Maintenance Bulanan"
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="recurring-client" required>
              Client
            </Label>
            <Select value={clientId} onValueChange={setClientId} required>
              <SelectTrigger id="recurring-client">
                <SelectValue placeholder="Pilih client…" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="recurring-project" optional>
              Proyek
            </Label>
            <Select
              value={projectId}
              onValueChange={setProjectId}
              disabled={!clientId}
            >
              <SelectTrigger id="recurring-project">
                <SelectValue placeholder="Pilih proyek…" />
              </SelectTrigger>
              <SelectContent>
                {filteredProjects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="recurring-frequency">Frekuensi</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="recurring-frequency">
                <SelectValue placeholder="Pilih frekuensi invoice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WEEKLY">Mingguan</SelectItem>
                <SelectItem value="MONTHLY">Bulanan</SelectItem>
                <SelectItem value="QUARTERLY">3 Bulan</SelectItem>
                <SelectItem value="YEARLY">Tahunan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="recurring-next-issue" required>
              Terbit Berikutnya
            </Label>
            <Input
              id="recurring-next-issue"
              type="date"
              value={nextIssueDate}
              onChange={(e) => setNextIssueDate(e.target.value)}
              placeholder="Pilih tanggal terbit berikutnya"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recurring-due-days">Hari Jatuh Tempo</Label>
            <Input
              type="number"
              min="1"
              max="90"
              value={dueDays}
              onChange={(e) => setDueDays(e.target.value)}
              id="recurring-due-days"
              placeholder="14"
            />
          </div>
        </div>
        <div className="max-w-xs space-y-2">
          <Label htmlFor="recurring-tax">Pajak (%)</Label>
          <Input
            type="number"
            min="0"
            max="100"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            id="recurring-tax"
            placeholder="11"
          />
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Line Items</h2>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              setItems((p) => [
                ...p,
                { description: "", quantity: "1", price: "0" },
              ])
            }
          >
            <Plus className="size-4" /> Tambah Item
          </Button>
        </div>
        <div className="space-y-3">
          {items.map((it, i) => (
            <div
              key={i}
              className="grid grid-cols-1 items-start gap-2 sm:grid-cols-[minmax(0,1fr)_80px_140px_40px]"
            >
              <div className="space-y-1.5">
                <Label htmlFor={`recurring-item-description-${i}`} required>
                  Deskripsi
                </Label>
                <Input
                  id={`recurring-item-description-${i}`}
                  placeholder="Deskripsi"
                  value={it.description}
                  onChange={(e) =>
                    updateItem(i, { description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`recurring-item-quantity-${i}`} required>
                  Kuantitas
                </Label>
                <Input
                  id={`recurring-item-quantity-${i}`}
                  type="number"
                  step="0.01"
                  placeholder="Qty"
                  value={it.quantity}
                  onChange={(e) => updateItem(i, { quantity: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`recurring-item-price-${i}`} required>
                  Harga (Rp)
                </Label>
                <Input
                  id={`recurring-item-price-${i}`}
                  type="number"
                  step="0.01"
                  placeholder="Harga"
                  value={it.price}
                  onChange={(e) => updateItem(i, { price: e.target.value })}
                  required
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={items.length === 1}
                onClick={() => setItems((p) => p.filter((_, idx) => idx !== i))}
                aria-label="Hapus item"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="border-t pt-3 text-sm">
          <div className="flex justify-between font-semibold">
            <span>Total per periode</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </Card>

      <Card className="space-y-2 p-6">
        <Label htmlFor="notes" optional>
          Catatan
        </Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Catatan yang akan muncul di invoice"
        />
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending || !clientId} size="lg">
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Menyimpan…
            </>
          ) : (
            "Simpan Template"
          )}
        </Button>
      </div>
    </form>
  );
}
