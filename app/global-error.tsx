"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="min-h-svh flex items-center justify-center px-4 bg-background text-foreground">
        <div className="text-center max-w-md space-y-5">
          <div className="size-16 rounded-full bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
            <AlertTriangle className="size-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Terjadi kesalahan</h1>
          <p className="text-muted-foreground">
            Maaf, ada masalah teknis. Kami sudah mencatatnya, silakan coba
            lagi.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground">Ref: {error.digest}</p>
          )}
          <div className="flex gap-3 justify-center">
            <Button onClick={reset}>Coba Lagi</Button>
            <Button asChild variant="outline">
              <Link href="/">Kembali ke Beranda</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
