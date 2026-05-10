import Link from "next/link";
import { Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-svh flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-5">
        <div className="size-16 rounded-full bg-muted mx-auto flex items-center justify-center">
          <Ghost className="size-8 text-muted-foreground" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">404</h1>
        <p className="text-muted-foreground">
          Halaman yang Anda cari tidak ditemukan.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Hubungi Kami</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
