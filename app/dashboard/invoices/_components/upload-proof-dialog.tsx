"use client";

import * as React from "react";
import Image from "next/image";
import {
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  FileText,
  Loader2,
  QrCode,
  ShieldCheck,
  Upload,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { submitPaymentProofAction } from "@/lib/actions/invoice";
import { createInvoicePaymentSnapAction } from "@/lib/actions/payment";

export type UploadProofDialogProps = {
  invoice: {
    id: string;
    number: string;
    total: number;
    dueDate: Date | string;
    paymentProofUrl?: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const BANK_ACCOUNTS = [
  {
    bank: "Bank Central Asia (BCA)",
    accountNumber: "801234567890",
    displayNumber: "8012-3456-7890",
    accountName: "PT Aldera Solusindo Mandiri",
  },
  {
    bank: "Bank Mandiri",
    accountNumber: "1370012345678",
    displayNumber: "137-00-1234567-8",
    accountName: "PT Aldera Solusindo Mandiri",
  },
];

export function UploadProofDialog({
  invoice,
  open,
  onOpenChange,
}: UploadProofDialogProps) {
  const [activeTab, setActiveTab] = React.useState<string>(
    invoice.paymentProofUrl ? "manual" : "midtrans"
  );
  const [copiedBank, setCopiedBank] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(
    invoice.paymentProofUrl || null
  );
  const [notes, setNotes] = React.useState<string>("");
  const [isUploading, setIsUploading] = React.useState<boolean>(false);
  const [isStartingMidtrans, setIsStartingMidtrans] =
    React.useState<boolean>(false);
  const [isPending, startTransition] = React.useTransition();

  const handleCopy = async (accountNumber: string, bank: string) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopiedBank(bank);
      toast.success(`Nomor rekening ${bank} berhasil disalin`);
      setTimeout(() => setCopiedBank(null), 2500);
    } catch {
      toast.error("Gagal menyalin nomor rekening");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 10MB");
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleMidtransPayment = async () => {
    setIsStartingMidtrans(true);
    try {
      const res = await createInvoicePaymentSnapAction(invoice.id);
      if (!res.ok || !res.redirectUrl) {
        toast.error(res.message || "Gagal membuat sesi pembayaran Midtrans.");
        return;
      }

      toast.success("Membuka pembayaran aman Midtrans...");
      // Buka halaman pembayaran resmi Midtrans Snap
      const paymentWindow = window.open(res.redirectUrl, "_blank");
      if (!paymentWindow) {
        // Fallback jika diblokir popup blocker
        window.location.href = res.redirectUrl;
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal memproses pembayaran Midtrans.";
      toast.error(msg);
    } finally {
      setIsStartingMidtrans(false);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !invoice.paymentProofUrl) {
      toast.error("Silakan pilih file bukti transfer terlebih dahulu.");
      return;
    }

    setIsUploading(true);

    try {
      let finalProofUrl = invoice.paymentProofUrl || "";

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData.error || "Gagal mengunggah file bukti transfer"
          );
        }

        const data = await res.json();
        finalProofUrl = data.url;
      }

      startTransition(async () => {
        const result = await submitPaymentProofAction({
          invoiceId: invoice.id,
          proofUrl: finalProofUrl,
          notes: notes.trim(),
        });

        if (!result.ok) {
          toast.error(
            result.message || "Gagal menyimpan konfirmasi pembayaran"
          );
        } else {
          toast.success(result.message || "Bukti pembayaran berhasil dikirim");
          onOpenChange(false);
        }
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan saat upload";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pembayaran Tagihan</DialogTitle>
          <DialogDescription>
            Invoice{" "}
            <span className="font-semibold text-foreground">
              {invoice.number}
            </span>{" "}
            senilai{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(invoice.total)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full pt-1"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="midtrans" className="text-xs sm:text-sm">
              Bayar Online (Midtrans)
            </TabsTrigger>
            <TabsTrigger value="manual" className="text-xs sm:text-sm">
              Transfer Manual
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: MIDTRANS SNAP ONLINE PAYMENT */}
          <TabsContent value="midtrans" className="space-y-4 pt-3">
            <div className="rounded-xl border bg-gradient-to-br from-brand-primary/5 via-background to-muted/40 p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                  <ShieldCheck className="size-5" />
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Verifikasi Otomatis Real-Time
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Pembayaran langsung terkonfirmasi tanpa perlu upload bukti.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                <div className="flex items-center gap-1.5 rounded-md border bg-background/80 p-2">
                  <QrCode className="size-3.5 shrink-0 text-brand-primary" />
                  <span className="font-medium text-foreground">QRIS</span>
                </div>
                <div className="flex items-center gap-1.5 rounded-md border bg-background/80 p-2">
                  <CreditCard className="size-3.5 shrink-0 text-brand-primary" />
                  <span className="font-medium text-foreground">
                    Kartu Kredit
                  </span>
                </div>
                <div className="flex items-center gap-1.5 rounded-md border bg-background/80 p-2">
                  <Wallet className="size-3.5 shrink-0 text-brand-primary" />
                  <span className="font-medium text-foreground">E-Wallet</span>
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-dashed bg-muted/30 p-2.5 text-center text-xs text-muted-foreground">
                Mendukung Virtual Account BCA, Mandiri, BRI, BNI, Permata,
                GoPay, dan ShopeePay.
              </div>
            </div>

            <Button
              type="button"
              disabled={isStartingMidtrans}
              onClick={handleMidtransPayment}
              className="h-11 w-full gap-2 bg-brand-primary text-sm font-semibold text-white shadow-sm hover:bg-brand-primary-hover"
            >
              {isStartingMidtrans ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Menyiapkan Pembayaran Midtrans...
                </>
              ) : (
                <>
                  <ExternalLink className="size-4" />
                  Bayar Sekarang via Midtrans ({formatCurrency(invoice.total)})
                </>
              )}
            </Button>
          </TabsContent>

          {/* TAB 2: MANUAL BANK TRANSFER & PROOF UPLOAD */}
          <TabsContent value="manual" className="space-y-4 pt-3">
            <form onSubmit={handleSubmitProof} className="space-y-4">
              {/* Bank Accounts Box */}
              <div className="space-y-3 rounded-lg border bg-muted/40 p-3">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Rekening Resmi PT Aldera Solusindo Mandiri
                </p>
                <div className="space-y-2">
                  {BANK_ACCOUNTS.map((acc) => (
                    <div
                      key={acc.bank}
                      className="flex items-center justify-between rounded-md border bg-background p-2.5 text-sm"
                    >
                      <div>
                        <p className="font-medium">{acc.bank}</p>
                        <p className="font-mono text-sm tracking-wide text-foreground">
                          {acc.displayNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          a.n. {acc.accountName}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 gap-1.5 px-2"
                        onClick={() => handleCopy(acc.accountNumber, acc.bank)}
                      >
                        {copiedBank === acc.bank ? (
                          <Check className="size-4 text-emerald-500" />
                        ) : (
                          <Copy className="size-4 text-muted-foreground" />
                        )}
                        <span className="text-xs">
                          {copiedBank === acc.bank ? "Tersalin" : "Salin"}
                        </span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* File Upload Dropzone */}
              <div className="space-y-2">
                <Label htmlFor="proof-file">
                  File Bukti Transfer (JPG, PNG, WebP, PDF max 10MB)
                </Label>
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition-colors hover:bg-muted/30">
                  <Upload className="mb-2 size-8 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {selectedFile
                      ? selectedFile.name
                      : "Klik atau seret file ke sini"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Pastikan nama pengirim dan nominal transfer terbaca jelas
                  </p>
                  <Input
                    id="proof-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-3"
                    onClick={() =>
                      document.getElementById("proof-file")?.click()
                    }
                  >
                    Pilih Dokumen
                  </Button>
                </div>

                {/* Preview image if available */}
                {previewUrl && (
                  <div className="relative mt-2 overflow-hidden rounded-md border bg-muted/20 p-2">
                    <p className="mb-1.5 text-xs text-muted-foreground">
                      Preview Bukti:
                    </p>
                    <div className="relative h-44 w-full overflow-hidden rounded">
                      <Image
                        src={previewUrl}
                        alt="Preview bukti transfer"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}
                {selectedFile && selectedFile.type === "application/pdf" && (
                  <div className="flex items-center gap-2 rounded-md border bg-muted/20 p-2 text-sm">
                    <FileText className="size-4 text-destructive" />
                    <span className="truncate">
                      {selectedFile.name} (Dokumen PDF)
                    </span>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="proof-notes">Catatan Pengirim (Opsional)</Label>
                <Textarea
                  id="proof-notes"
                  placeholder="Contoh: Transfer m-BCA dari rekening a.n. Budi Santoso"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none text-sm"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUploading || isPending}
                  onClick={() => onOpenChange(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isUploading || isPending}
                  className="gap-2 bg-brand-primary text-white hover:bg-brand-primary-hover"
                >
                  {isUploading || isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Check className="size-4" />
                      Kirim Bukti Pembayaran
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
