"use client";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Unlink } from "lucide-react";
import type { AccountBindingState } from "../_hooks/use-account-binding";
export function BindingLinkedPanel({ state }: { state: AccountBindingState }) {
  const {
    submitting,
    status,
    unlinkDialogOpen,
    setUnlinkDialogOpen,
    confirmUnlink,
  } = state;
  return (
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
        ✅ Akun Telegram Anda aktif tersinkronisasi. Anda dapat menggunakan
        perintah <code className="font-semibold text-emerald-800">/saldo</code>,{" "}
        <code className="font-semibold text-emerald-800">/apikey</code>, dan{" "}
        <code className="font-semibold text-emerald-800">/models</code> di bot
        Telegram dengan saldo yang sama dengan akun web ini.
      </p>
    </div>
  );
}
