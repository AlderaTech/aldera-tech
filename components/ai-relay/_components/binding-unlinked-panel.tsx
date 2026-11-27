"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Check,
  Copy,
  ExternalLink,
  Link2,
  Loader2,
  RefreshCw,
  Send,
} from "lucide-react";
import type { AccountBindingState } from "../_hooks/use-account-binding";
export function BindingUnlinkedPanel({
  state,
}: {
  state: AccountBindingState;
}) {
  const {
    submitting,
    status,
    copiedCode,
    copiedLink,
    handleGenerate,
    copyToClipboard,
  } = state;
  return (
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
                Berlaku hingga 15 menit ke depan. Pilih salah satu cara berikut
                untuk menghubungkan:
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
                asChild
              >
                <a
                  href={status.activeToken.deepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Buka di Telegram Bot
                  <ExternalLink className="ml-1.5 h-3 w-3 opacity-80" />
                </a>
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
              Hubungkan akun web Anda dengan bot Telegram untuk melihat saldo,
              menerima notifikasi low-balance otomatis, dan mengelola API Key
              langsung dari aplikasi Telegram.
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
  );
}
