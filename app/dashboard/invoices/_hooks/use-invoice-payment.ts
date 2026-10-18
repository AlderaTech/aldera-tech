"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { toast } from "sonner";
import { submitPaymentProofAction } from "@/lib/actions/invoice";
import { createInvoicePaymentSnapAction } from "@/lib/actions/payment";
import { API_ROUTES } from "@/lib/routes";
import type { PaymentInvoice } from "../_types/invoice";

export function useInvoicePayment(
  invoice: PaymentInvoice,
  onOpenChange: (open: boolean) => void
) {
  const [activeTab, setActiveTab] = useState(
    invoice.paymentProofUrl ? "manual" : "midtrans"
  );
  const [copiedBank, setCopiedBank] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    invoice.paymentProofUrl || null
  );
  const [notes, setNotes] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isStartingMidtrans, setIsStartingMidtrans] = useState(false);
  const [isPending, startTransition] = useTransition();
  const requestInFlight = useRef(false);

  useEffect(
    () => () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  async function handleCopy(accountNumber: string, bank: string) {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopiedBank(bank);
      toast.success(`Nomor rekening ${bank} berhasil disalin`);
      setTimeout(() => setCopiedBank(null), 2500);
    } catch {
      toast.error("Gagal menyalin nomor rekening");
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setFileError("Ukuran file maksimal 10MB");
      toast.error("Ukuran file maksimal 10MB");
      return;
    }
    setFileError(null);
    setRequestError(null);
    setSelectedFile(file);
    setPreviewUrl(
      file.type.startsWith("image/") ? URL.createObjectURL(file) : null
    );
  }

  async function handleMidtransPayment() {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    setIsStartingMidtrans(true);
    setRequestError(null);
    try {
      const res = await createInvoicePaymentSnapAction(invoice.id);
      if (!res.ok || !res.redirectUrl) {
        const message =
          res.message || "Gagal membuat sesi pembayaran Midtrans.";
        setRequestError(message);
        toast.error(message);
        return;
      }
      toast.success("Membuka pembayaran aman Midtrans...");
      const paymentWindow = window.open(res.redirectUrl, "_blank");
      if (!paymentWindow) window.location.href = res.redirectUrl;
      onOpenChange(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal memproses pembayaran Midtrans.";
      setRequestError(message);
      toast.error(message);
    } finally {
      requestInFlight.current = false;
      setIsStartingMidtrans(false);
    }
  }

  function handleSubmitProof(event: FormEvent) {
    event.preventDefault();
    if (requestInFlight.current) return;
    if (!selectedFile && !invoice.paymentProofUrl) {
      const message = "Silakan pilih file bukti transfer terlebih dahulu.";
      setFileError(message);
      toast.error(message);
      document.getElementById("proof-file-button")?.focus();
      return;
    }
    requestInFlight.current = true;
    setRequestError(null);
    startTransition(async () => {
      try {
        let finalProofUrl = invoice.paymentProofUrl || "";
        if (selectedFile) {
          setIsUploading(true);
          const formData = new FormData();
          formData.append("file", selectedFile);
          const res = await fetch(API_ROUTES.upload, {
            method: "POST",
            body: formData,
          });
          const data: unknown = await res.json().catch(() => null);
          if (!res.ok) {
            throw new Error(
              data &&
                typeof data === "object" &&
                "error" in data &&
                typeof data.error === "string"
                ? data.error
                : "Gagal mengunggah file bukti transfer"
            );
          }
          if (
            !data ||
            typeof data !== "object" ||
            !("url" in data) ||
            typeof data.url !== "string"
          ) {
            throw new Error("Gagal mengunggah file bukti transfer");
          }
          finalProofUrl = data.url;
          setIsUploading(false);
        }
        const result = await submitPaymentProofAction({
          invoiceId: invoice.id,
          proofUrl: finalProofUrl,
          notes: notes.trim(),
        });
        if (!result.ok) {
          const message =
            result.message || "Gagal menyimpan konfirmasi pembayaran";
          setRequestError(message);
          toast.error(message);
        } else {
          toast.success(result.message || "Bukti pembayaran berhasil dikirim");
          onOpenChange(false);
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat upload";
        setRequestError(message);
        toast.error(message);
      } finally {
        requestInFlight.current = false;
        setIsUploading(false);
      }
    });
  }

  return {
    activeTab,
    setActiveTab,
    copiedBank,
    selectedFile,
    previewUrl,
    notes,
    setNotes,
    fileError,
    requestError,
    isUploading,
    isStartingMidtrans,
    isPending,
    isBusy: isUploading || isPending || isStartingMidtrans,
    handleCopy,
    handleFileChange,
    handleMidtransPayment,
    handleSubmitProof,
  };
}

export type InvoicePaymentState = ReturnType<typeof useInvoicePayment>;
