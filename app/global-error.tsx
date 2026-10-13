"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/lib/routes";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="flex min-h-svh items-center justify-center bg-background px-4 text-foreground">
        <div className="max-w-md space-y-5 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Terjadi kesalahan
          </h1>
          <p className="text-muted-foreground">
            Maaf, ada masalah teknis. Kami sudah mencatatnya, silakan coba lagi.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground">Ref: {error.digest}</p>
          )}
          <div className="flex justify-center gap-3">
            <Button onClick={reset}>Coba Lagi</Button>
            <Button asChild variant="outline">
              <Link href={PUBLIC_ROUTES.home}>Kembali ke Beranda</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
