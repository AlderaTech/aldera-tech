"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { DASHBOARD_ROUTES } from "@/lib/routes";

export function CalculatorSuccessScreen({
  total,
  onReset,
}: {
  total: number;
  onReset: () => void;
}) {
  return (
    <Card className="flex flex-col items-center border-border p-8 text-center shadow-sm sm:p-12">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="size-8" />
      </div>
      <h2 className="text-2xl font-black text-foreground">
        Estimasi Anda berhasil diajukan!
      </h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Tim software architect Aldera Tech akan meninjau spesifikasi fitur dan
        menghubungi Anda dalam 1×24 jam untuk finalisasi penawaran teknis.
      </p>
      <div className="mt-6 rounded-lg border border-border bg-muted/50 px-6 py-3">
        <p className="text-xs font-medium text-muted-foreground">
          Total Estimasi Proyek
        </p>
        <p className="text-xl font-bold text-primary tabular-nums">
          {formatCurrency(total)}
        </p>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="gap-2">
          <Link href={DASHBOARD_ROUTES.orders}>
            Lihat Riwayat Estimasi <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RotateCcw className="size-4" /> Hitung Estimasi Lain
        </Button>
      </div>
    </Card>
  );
}
