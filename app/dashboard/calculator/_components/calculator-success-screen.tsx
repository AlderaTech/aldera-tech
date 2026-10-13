"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function CalculatorSuccessScreen({
  total,
  onReset,
}: {
  total: number;
  onReset: () => void;
}) {
  return (
    <Card className="flex flex-col items-center p-10 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle2 className="size-8 text-primary" />
      </div>
      <h2 className="text-2xl font-black">Estimasi Anda sudah dikirim!</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Tim kami akan menghubungi Anda dalam 1x24 jam untuk mendiskusikan detail
        proyek dan membuat proposal resmi.
      </p>
      <p className="mt-4 text-lg font-bold">
        Total estimasi: {formatCurrency(total)}
      </p>
      <Button className="mt-6" onClick={onReset}>
        Hitung Estimasi Baru
      </Button>
    </Card>
  );
}
