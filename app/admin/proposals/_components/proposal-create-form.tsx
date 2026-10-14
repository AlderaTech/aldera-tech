"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { TipTapEditor } from "@/components/editor/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createProposalAction,
  type ProposalActionState,
} from "@/lib/actions/proposal";
import { formatCurrency } from "@/lib/utils";
import { ADMIN_ROUTES } from "@/lib/routes";

type ProposalItemDraft = {
  description: string;
  quantity: string;
  price: string;
};

const initialContent =
  "<h2>Scope Pekerjaan</h2><p>Jelaskan tujuan, deliverables, timeline, dan ketentuan utama proposal ini.</p>";

export function ProposalCreateForm() {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [content, setContent] = React.useState(initialContent);
  const [taxRate, setTaxRate] = React.useState("11");
  const [items, setItems] = React.useState<ProposalItemDraft[]>([
    { description: "", quantity: "1", price: "0" },
  ]);

  const subtotal = items.reduce(
    (sum, item) =>
      sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
    0
  );
  const taxAmount = (subtotal * (Number(taxRate) || 0)) / 100;
  const total = subtotal + taxAmount;

  function updateItem(index: number, patch: Partial<ProposalItemDraft>) {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item))
    );
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { description: "", quantity: "1", price: "0" },
    ]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("content", content);
    formData.set("taxRate", taxRate);
    formData.set(
      "items",
      JSON.stringify(
        items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity) || 0,
          price: Number(item.price) || 0,
        }))
      )
    );

    startTransition(async () => {
      const empty: ProposalActionState = { ok: false };
      const result = await createProposalAction(empty, formData);
      if (result.ok && result.proposalId) {
        toast.success(result.message ?? "Proposal dibuat");
        router.push(ADMIN_ROUTES.proposalDetail(result.proposalId));
        router.refresh();
      } else {
        toast.error(result.message ?? "Gagal membuat proposal");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl space-y-6">
      <Card className="space-y-5 p-6">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Proposal</Label>
            <Input
              id="title"
              name="title"
              required
              placeholder="Website company profile PT Contoh"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Berlaku Sampai</Label>
            <Input
              id="expiresAt"
              name="expiresAt"
              type="date"
              placeholder="Pilih tanggal kedaluwarsa"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="summary">Ringkasan</Label>
          <Textarea
            id="summary"
            name="summary"
            rows={3}
            placeholder="Ringkasan singkat untuk client dan project conversion."
          />
        </div>
      </Card>

      <Card className="space-y-5 p-6">
        <h2 className="font-semibold">Client</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="clientName">Nama</Label>
            <Input
              id="clientName"
              name="clientName"
              placeholder="Nama lengkap client"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Email</Label>
            <Input
              id="clientEmail"
              name="clientEmail"
              type="email"
              placeholder="client@perusahaan.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientPhone">No. WhatsApp</Label>
            <Input
              id="clientPhone"
              name="clientPhone"
              type="tel"
              placeholder="081234567890"
            />
          </div>
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Line Items</h2>
          <Button type="button" size="sm" variant="outline" onClick={addItem}>
            <Plus className="size-4" /> Tambah Item
          </Button>
        </div>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="grid items-start gap-2 sm:grid-cols-[1fr_90px_160px_40px]"
            >
              <Input
                value={item.description}
                onChange={(event) =>
                  updateItem(index, { description: event.target.value })
                }
                placeholder="Deskripsi pekerjaan"
                required
              />
              <Input
                value={item.quantity}
                onChange={(event) =>
                  updateItem(index, { quantity: event.target.value })
                }
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Qty"
                required
              />
              <Input
                value={item.price}
                onChange={(event) =>
                  updateItem(index, { price: event.target.value })
                }
                type="number"
                min="0"
                step="0.01"
                placeholder="Harga"
                required
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
                aria-label="Hapus item"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="grid gap-4 border-t pt-4 md:grid-cols-[180px_1fr]">
          <div className="space-y-2">
            <Label htmlFor="taxRate">Pajak (%)</Label>
            <Input
              id="taxRate"
              value={taxRate}
              onChange={(event) => setTaxRate(event.target.value)}
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="11"
            />
          </div>
          <div className="space-y-1 text-sm md:ml-auto md:min-w-72">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pajak</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-bold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="space-y-3 p-6">
        <Label>Konten Proposal</Label>
        <TipTapEditor
          value={content}
          onChange={setContent}
          placeholder="Tulis scope, timeline, asumsi, dan ketentuan proposal..."
        />
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Menyimpan...
            </>
          ) : (
            "Buat Proposal"
          )}
        </Button>
      </div>
    </form>
  );
}
