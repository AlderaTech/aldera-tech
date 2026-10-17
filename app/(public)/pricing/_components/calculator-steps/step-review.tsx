"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, MessageCircle, Send, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { AUTH_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";
import type { Config } from "../../_types/calculator";

type StepReviewProps = {
  config: Config;
  notes: string;
  onNotesChange: (notes: string) => void;
  deadline: string;
  onDeadlineChange: (deadline: string) => void;
  isAuthenticated: boolean;
  pending: boolean;
  total: number;
  ptName?: string;
  whatsappNumber?: string;
  onBack: () => void;
  onSubmit: () => void;
};

export function StepReview({
  config,
  notes,
  onNotesChange,
  deadline,
  onDeadlineChange,
  isAuthenticated,
  pending,
  total,
  ptName,
  whatsappNumber,
  onBack,
  onSubmit,
}: StepReviewProps) {
  const rawDigits = (whatsappNumber || "6281234567890").replace(/\D/g, "");
  let waDigits = rawDigits;
  if (rawDigits.startsWith("0")) {
    waDigits = "62" + rawDigits.slice(1);
  } else if (!rawDigits.startsWith("62")) {
    waDigits = "62" + rawDigits;
  }
  const waText = `Halo Aldera Tech, saya telah membuat estimasi di website untuk proyek *${ptName || "Kustom"}* dengan estimasi biaya *${formatCurrency(total)}*. Saya ingin berkonsultasi lebih lanjut.`;
  const whatsappHref = `https://wa.me/${waDigits || "6281234567890"}?text=${encodeURIComponent(waText)}`;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">
          5. Review & Pengajuan Estimasi
        </h3>
        <p className="text-sm text-muted-foreground">
          Tinjau ringkasan, lengkapi catatan proyek, dan ajukan estimasi Anda.
        </p>
      </div>

      {config?.revisionPolicy && (
        <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-4 text-xs">
          <div>
            <p className="font-semibold text-foreground">Jatah Revisi Gratis</p>
            <p className="text-muted-foreground">
              Termasuk {config.freeRevisions}× revisi minor. Revisi berikutnya{" "}
              {formatCurrency(Number(config.revisionPricePerItem))}/item fitur.
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Kebijakan Revisi</p>
            <p className="whitespace-pre-line text-muted-foreground">
              {config.revisionPolicy}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="review-notes" className="text-sm font-medium">
            Catatan Tambahan (Opsional)
          </Label>
          <Textarea
            id="review-notes"
            rows={3}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Jelaskan kebutuhan khusus, referensi desain, atau ekspektasi arsitektur sistem Anda..."
            className="resize-none text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="review-deadline" className="text-sm font-medium">
            Target Peluncuran (Opsional)
          </Label>
          <Input
            id="review-deadline"
            type="date"
            value={deadline}
            onChange={(e) => onDeadlineChange(e.target.value)}
            className="max-w-xs text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-3">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="size-4" /> Kembali
        </Button>

        {isAuthenticated ? (
          <Button onClick={onSubmit} disabled={pending} className="gap-2">
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Ajukan Proyek
          </Button>
        ) : (
          <div className="flex flex-wrap items-center gap-2.5">
            <Button asChild className="gap-2">
              <Link
                href={AUTH_ROUTES.loginWithCallback(
                  `${PUBLIC_ROUTES.pricing}#calculator`
                )}
              >
                <LogIn className="size-4" /> Masuk & Ajukan
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="gap-2 border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
            >
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4 text-emerald-600 dark:text-emerald-400" />
                Konsultasi WhatsApp
              </a>
            </Button>
          </div>
        )}
      </div>

      {!isAuthenticated && (
        <p className="text-xs text-muted-foreground">
          Belum login? Anda dapat langsung berkonsultasi via WhatsApp dengan
          ringkasan estimasi yang telah dihitung, atau masuk ke akun Anda agar
          estimasi ini tersimpan langsung di dashboard.
        </p>
      )}
    </div>
  );
}
