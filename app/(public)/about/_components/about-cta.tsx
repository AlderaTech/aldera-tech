import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/shared/motion";
import { PUBLIC_ROUTES } from "@/lib/routes";

export function AboutCta() {
  return (
    <section className="editorial-surface">
      <div className="mx-auto max-w-screen-xxxl public-container-px pb-14 sm:pb-20">
        <FadeUp>
          <div className="rounded-xl bg-[#08090d] p-8 text-center text-white sm:p-12">
            <h2 className="editorial-display mb-4 text-4xl sm:text-5xl">
              Mari berkenalan
            </h2>
            <p className="mx-auto mb-6 max-w-xl opacity-90">
              Kami senang mendengar ide Anda. Konsultasi 30 menit gratis tanpa
              komitmen.
            </p>
            <Button
              asChild
              size="xl"
              className="bg-[#0b6bff] text-white hover:bg-[#075bd8]"
            >
              <Link href={PUBLIC_ROUTES.contact}>Konsultasi Gratis</Link>
            </Button>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
