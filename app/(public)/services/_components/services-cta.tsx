import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/shared/motion";
import { PUBLIC_ROUTES } from "@/lib/routes";

export function ServicesCta() {
  return (
    <section className="editorial-surface">
      <div className="public-container-px mx-auto max-w-screen-xxxl pb-14 sm:pb-20">
        <FadeUp>
          <div className="rounded-xl border border-black/10 bg-white/75 p-8 text-center shadow-xl sm:p-12">
            <h2 className="editorial-display mb-3 text-4xl sm:text-5xl">
              Butuh paket custom?
            </h2>
            <p className="mx-auto mb-6 max-w-xl text-black/60">
              Setiap bisnis unik. Kami siap mendesain solusi yang persis sesuai
              kebutuhan Anda.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-[#08090d] text-white hover:bg-black"
            >
              <Link href={PUBLIC_ROUTES.contact}>Konsultasi Gratis</Link>
            </Button>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
