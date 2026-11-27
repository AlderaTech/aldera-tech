"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DataLoadError({
  reset,
  headingLevel = 1,
}: {
  reset: () => void;
  headingLevel?: 1 | 2;
}) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  return (
    <section
      role="alert"
      className="mx-auto my-8 w-full max-w-xl rounded-3xl border border-border bg-card p-6 text-center shadow-sm sm:p-8"
    >
      <AlertCircle
        className="mx-auto mb-4 size-9 text-primary"
        aria-hidden="true"
      />
      <Heading className="text-xl font-bold text-foreground">
        Data belum dapat dimuat
      </Heading>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Terjadi kendala saat mengambil data. Coba kembali untuk memuat informasi
        terbaru.
      </p>
      <Button onClick={reset} className="mt-5 rounded-full">
        <RotateCcw className="size-4" aria-hidden="true" />
        Coba lagi
      </Button>
    </section>
  );
}
