"use client";

import { useState, useEffect } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  RefreshCw,
  Send,
  ShieldCheck,
  Unlink,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  generateBindingTokenAction,
  getBindingStatusAction,
  unlinkTelegramAccountAction,
  type BindingStatusResult,
} from "@/lib/actions/binding";

export function AccountBindingCard() {
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
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleGenerate = async () => {
    try {
      setSubmitting(true);
      const res = await generateBindingTokenAction();
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

  if (loading) {
    return (
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-3.5 w-72" />
              </div>
            </div>
            <Skeleton className="h-8 w-20 self-start rounded-md sm:self-auto" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-32 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-2.5 text-blue-600">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
                Integrasi Telegram Bot
                {status.isBound ? (
                  <Badge className="border-emerald-200 bg-emerald-100 text-xs font-semibold text-emerald-800 hover:bg-emerald-100">
                    <ShieldCheck className="mr-1 h-3 w-3" />
                    Terhubung
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-amber-200 bg-amber-50 text-xs font-semibold text-amber-800"
                  >
                    Belum Terhubung
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs text-muted-foreground">
                Sinkronisasikan saldo Rupiah, top-up, dan API Key antara
                dashboard web dan bot Telegram.
              </CardDescription>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchStatus}
            disabled={submitting}
            className="h-8 self-start text-xs text-slate-600 hover:text-slate-900 sm:self-auto"
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-0">
        {status.isBound ? (
          // ================= BOUND STATE =================
          <div className="space-y-4 rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 sm:p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="space-y-1">
                <span className="block text-xs font-semibold tracking-wider text-emerald-900 uppercase">
                  Detail Akun Telegram Terhubung
                </span>
                <div className="flex items-center gap-2 font-mono text-sm text-slate-800">
                  <span className="font-bold">Telegram ID:</span>
                  <code className="rounded border border-emerald-200 bg-white px-2 py-0.5 font-semibold text-emerald-900">
                    {String(status.telegramId)}
                  </code>
                  {status.telegramUsername && (
                    <span className="font-sans text-xs text-slate-500">
                      (@{status.telegramUsername})
                    </span>
                  )}
                </div>
              </div>

              <ConfirmDialog
                open={unlinkDialogOpen}
                onOpenChange={setUnlinkDialogOpen}
                title="Putuskan Tautan Akun Telegram"
                description="Apakah Anda yakin ingin memutuskan tautan akun Telegram ini? Sinkronisasi saldo dan akses bot Telegram akan dinonaktifkan."
                confirmLabel="Putuskan Tautan"
                cancelLabel="Batal"
                destructive
                pending={submitting}
                onConfirm={confirmUnlink}
                trigger={
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={submitting}
                    className="h-8 cursor-pointer self-start bg-rose-600 text-xs hover:bg-rose-700 sm:self-auto"
                  >
                    {submitting ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Unlink className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Putuskan Tautan
                  </Button>
                }
              />
            </div>

            <p className="border-t border-emerald-200/60 pt-3 text-xs leading-relaxed text-slate-600">
              ✅ Akun Telegram Anda aktif tersinkronisasi. Anda dapat
              menggunakan perintah{" "}
              <code className="font-semibold text-emerald-800">/saldo</code>,{" "}
              <code className="font-semibold text-emerald-800">/apikey</code>,
              dan{" "}
              <code className="font-semibold text-emerald-800">/models</code> di
              bot Telegram dengan saldo yang sama dengan akun web ini.
            </p>
          </div>
        ) : (
          // ================= UNBOUND STATE =================
          <div className="space-y-5">
            {status.activeToken ? (
              <div className="space-y-5 rounded-xl border border-blue-200 bg-blue-50/50 p-5">
                <div className="flex flex-col justify-between gap-2 border-b border-blue-200/60 pb-3 sm:flex-row sm:items-center">
                  <div>
                    <span className="text-xs font-bold tracking-wider text-blue-900 uppercase">
                      Kode Verifikasi Penautan Akun
                    </span>
                    <p className="mt-0.5 text-xs text-blue-700">
                      Berlaku hingga 15 menit ke depan. Pilih salah satu cara
                      berikut untuk menghubungkan:
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="self-start border-blue-300 bg-white text-[11px] text-blue-700 sm:self-auto"
                  >
                    Berlaku 15 Menit
                  </Badge>
                </div>

                {/* Option 1: One-click Telegram Deep-link */}
                <div className="space-y-2 rounded-lg border border-blue-100 bg-white p-4 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="block text-xs font-bold text-slate-900">
                        Metode 1: Buka Tautan Otomatis (Direkomendasikan)
                      </span>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Klik tombol untuk langsung membuka Telegram dan bot akan
                        otomatis menautkan akun Anda.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5 pt-2">
                    <Button
                      className="h-9 bg-blue-600 text-xs text-white shadow-xs hover:bg-blue-700"
                      onClick={() =>
                        window.open(status.activeToken?.deepLink, "_blank")
                      }
                    >
                      <Send className="mr-1.5 h-3.5 w-3.5" />
                      Buka di Telegram Bot
                      <ExternalLink className="ml-1.5 h-3 w-3 opacity-80" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-9 text-xs text-slate-700"
                      onClick={() =>
                        status.activeToken &&
                        copyToClipboard(status.activeToken.deepLink, "link")
                      }
                    >
                      {copiedLink ? (
                        <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                      )}
                      Salin Link Tautan
                    </Button>
                  </div>
                </div>

                {/* Option 2: 6-digit Code */}
                <div className="space-y-2 rounded-lg border border-blue-100 bg-white p-4 shadow-2xs">
                  <div>
                    <span className="block text-xs font-bold text-slate-900">
                      Metode 2: Masukkan Kode 6-Digit di Bot
                    </span>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Buka bot di Telegram, lalu kirim perintah manual:{" "}
                      <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-slate-800">
                        /bind {status.activeToken.code}
                      </code>
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:items-center">
                    <div className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 font-mono text-2xl font-extrabold tracking-widest text-blue-900">
                      <span>{status.activeToken.code.slice(0, 3)}</span>
                      <span>{status.activeToken.code.slice(3)}</span>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-10 px-4 text-xs font-semibold"
                      onClick={() =>
                        status.activeToken &&
                        copyToClipboard(status.activeToken.code, "code")
                      }
                    >
                      {copiedCode ? (
                        <Check className="mr-1.5 h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="mr-1.5 h-4 w-4 text-slate-600" />
                      )}
                      {copiedCode ? "Tersalin!" : "Salin Kode"}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={submitting}
                    className="text-xs text-blue-700 hover:bg-blue-100/50 hover:text-blue-900"
                  >
                    {submitting ? (
                      <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-1.5 h-3 w-3" />
                    )}
                    Buat Kode Baru
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center">
                <div className="mx-auto w-fit rounded-full bg-blue-100 p-3 text-blue-600">
                  <Link2 className="h-6 w-6" />
                </div>
                <div className="mx-auto max-w-md space-y-1">
                  <h4 className="text-sm font-semibold text-slate-900">
                    Tautkan Akun Telegram Anda
                  </h4>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Hubungkan akun web Anda dengan bot Telegram untuk melihat
                    saldo, menerima notifikasi low-balance otomatis, dan
                    mengelola API Key langsung dari aplikasi Telegram.
                  </p>
                </div>
                <div>
                  <Button
                    onClick={handleGenerate}
                    disabled={submitting}
                    className="h-9 bg-blue-600 px-5 text-xs text-white shadow-xs hover:bg-blue-700"
                  >
                    {submitting ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Generate Tautan & Kode Binding
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
