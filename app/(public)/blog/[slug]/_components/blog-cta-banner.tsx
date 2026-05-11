import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/lib/routes";

export function BlogCtaBanner() {
  return (
    <div className="mt-12 rounded-xl border border-black/10 bg-[#08090d] p-6 text-center text-white sm:p-8">
      <h3 className="text-xl font-black sm:text-2xl">
        Butuh bantuan implementasi?
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-white/72">
        Tim kami siap membantu mewujudkan ide dari artikel ini menjadi produk
        nyata untuk bisnis Anda.
      </p>
      <Button
        asChild
        size="lg"
        className="mt-5 bg-[#0b6bff] text-white hover:bg-[#075bd8]"
      >
        <Link href={PUBLIC_ROUTES.contact}>
          Konsultasi Gratis
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
