import Link from "next/link";
import { Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/lib/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <div className="max-w-md space-y-5 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted">
          <Ghost className="size-8 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">404</h1>
        <p className="text-muted-foreground">
          Halaman yang Anda cari tidak ditemukan.
        </p>
        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link href={PUBLIC_ROUTES.home}>Kembali ke Beranda</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={PUBLIC_ROUTES.contact}>Hubungi Kami</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
