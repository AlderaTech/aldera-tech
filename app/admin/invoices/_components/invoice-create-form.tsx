"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createInvoiceAction,
  type InvoiceActionState,
} from "@/lib/actions/invoice";
import { formatCurrency } from "@/lib/utils";

type Client = { id: string; name: string; email: string };
type Project = { id: string; title: string; clientId: string };

type Item = { description: string; quantity: string; price: string };

export function InvoiceCreateForm({
  clients,
  projects,
}: {
  clients: Client[];
  projects: Project[];
}) {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [taxRate, setTaxRate] = useState("11");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Item[]>([
    { description: "", quantity: "1", price: "0" },
  ]);
  const [isPending, startTransition] = useTransition();

  const filteredProjects = projects.filter((p) => p.clientId === clientId);

  const subtotal = items.reduce(
    (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.price) || 0),
    0
  );
  const taxAmount = (subtotal * (Number(taxRate) || 0)) / 100;
  const total = subtotal + taxAmount;

  function updateItem(i: number, patch: Partial<Item>) {
    setItems((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it))
    );
  }

  function addItem() {
    setItems((prev) => [...prev, { description: "", quantity: "1", price: "0" }]);
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("clientId", clientId);
    fd.set("projectId", projectId);
    fd.set("issueDate", issueDate);
    fd.set("dueDate", dueDate);
    fd.set("taxRate", taxRate);
    fd.set("notes", notes);
    fd.set(
      "items",
      JSON.stringify(
        items.map((it) => ({
          description: it.description,
          quantity: Number(it.quantity) || 0,
          price: Number(it.price) || 0,
        }))
      )
    );
    startTransition(async () => {
      const empty: InvoiceActionState = { ok: false };
      const result = await createInvoiceAction(empty, fd);
      if (result.ok && result.invoiceId) {
        toast.success(result.message ?? "Invoice dibuat");
        router.push(`/admin/invoices/${result.invoiceId}`);
        router.refresh();
      } else {
        toast.error(result.message ?? "Gagal");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <Card className="p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Client</Label>
            <Select value={clientId} onValueChange={setClientId} required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih client…" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}, {c.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Proyek (opsional)</Label>
            <Select value={projectId} onValueChange={setProjectId} disabled={!clientId}>
              <SelectTrigger>
                <SelectValue placeholder={clientId ? "Pilih proyek…" : "Pilih client dulu"} />
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

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="issueDate">Tanggal Terbit</Label>
            <Input
              id="issueDate"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              placeholder="Pilih tanggal terbit"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Jatuh Tempo</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="Pilih tanggal jatuh tempo"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxRate">Pajak (%)</Label>
            <Input
              id="taxRate"
              type="number"
              min="0"
              max="100"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              placeholder="11"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Line Items</h2>
          <Button type="button" size="sm" variant="outline" onClick={addItem}>
            <Plus className="size-4" /> Tambah Item
          </Button>
        </div>
        <div className="space-y-3">
          {items.map((it, i) => (
            <div
              key={i}
              className="grid grid-cols-1 sm:grid-cols-[1fr_80px_140px_40px] gap-2 items-start"
            >
              <Input
                placeholder="Deskripsi"
                value={it.description}
                onChange={(e) => updateItem(i, { description: e.target.value })}
                required
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Qty"
                value={it.quantity}
                onChange={(e) => updateItem(i, { quantity: e.target.value })}
                required
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Harga"
                value={it.price}
                onChange={(e) => updateItem(i, { price: e.target.value })}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(i)}
                disabled={items.length === 1}
                aria-label="Hapus item"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="border-t pt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pajak ({taxRate}%)</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t font-bold text-base">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-3">
        <Label htmlFor="notes">Catatan (opsional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Catatan untuk client…"
        />
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isPending || !clientId}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Menyimpan…
            </>
          ) : (
            "Buat Invoice"
          )}
        </Button>
      </div>
    </form>
  );
}
