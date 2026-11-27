"use client";
import {
  generateBindingTokenAction,
  getBindingStatusAction,
  unlinkTelegramAccountAction,
  type BindingStatusResult,
} from "@/lib/actions/binding";
import { useEffect, useState } from "react";
import { toast } from "sonner";
export function useAccountBinding() {
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [status, setStatus] = useState<BindingStatusResult>({ isBound: false });
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState<boolean>(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await getBindingStatusAction();
      setStatus(res);
    } catch (err) {
      console.error("Failed to load binding status:", err);
      setStatus({
        isBound: false,
        error: "Status Telegram belum dapat dimuat.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getBindingStatusAction()
      .then((res) => {
        if (active) {
          setStatus(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load binding status:", err);
        if (active) {
          setStatus({
            isBound: false,
            error: "Status Telegram belum dapat dimuat.",
          });
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const handleGenerate = async () => {
    try {
      setSubmitting(true);
      const res = await generateBindingTokenAction();
      if (res.availability === "paused") {
        setStatus((current) => ({
          ...current,
          availability: "paused",
          activeToken: null,
        }));
        return;
      }
      if (!res.success || !res.token || !res.code || !res.deepLink) {
        toast.error(res.error ?? "Gagal membuat kode verifikasi binding");
        return;
      }
      setStatus({
        isBound: false,
        activeToken: {
          token: res.token,
          code: res.code,
          deepLink: res.deepLink,
          expiresAt:
            res.expiresAt ??
            new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        },
      });
      toast.success("Kode binding baru berhasil digenerate!");
    } catch {
      toast.error("Terjadi kesalahan saat membuat kode binding");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmUnlink = async () => {
    try {
      setSubmitting(true);
      const res = await unlinkTelegramAccountAction();
      if (!res.success) {
        toast.error(res.error ?? "Gagal memutuskan tautan");
        return;
      }
      toast.success("Tautan akun Telegram berhasil diputuskan");
      await fetchStatus();
    } catch {
      toast.error("Terjadi kesalahan saat memutuskan tautan");
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string, type: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "code") {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
        toast.success("Kode 6-digit berhasil disalin!");
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
        toast.success("Tautan Telegram berhasil disalin!");
      }
    } catch {
      toast.error("Gagal menyalin ke clipboard");
    }
  };

  return {
    loading,
    setLoading,
    submitting,
    setSubmitting,
    status,
    setStatus,
    copiedCode,
    setCopiedCode,
    copiedLink,
    setCopiedLink,
    unlinkDialogOpen,
    setUnlinkDialogOpen,
    fetchStatus,
    handleGenerate,
    confirmUnlink,
    copyToClipboard,
  };
}
export type AccountBindingState = ReturnType<typeof useAccountBinding>;
