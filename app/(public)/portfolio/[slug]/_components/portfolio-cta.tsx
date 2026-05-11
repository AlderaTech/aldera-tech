import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/lib/routes";

export function PortfolioCta() {
  return (
    <section className="editorial-surface">
      <div className="mx-auto max-w-screen-md public-container-px pb-20">
        <div className="rounded-xl bg-[#08090d] p-8 text-center text-white sm:p-12">
          <h2 className="editorial-display mb-3 text-3xl sm:text-4xl">
            Ingin hasil serupa untuk bisnis Anda?
          </h2>
          <p className="mx-auto mb-6 max-w-lg text-white/72">
            Konsultasi 30 menit gratis. Ceritakan kebutuhan Anda dan kami
            buatkan proposal dalam 1x24 jam.
          </p>
          <Button
            asChild
            size="xl"
            className="group bg-[#0b6bff] text-white hover:bg-[#075bd8]"
          >
            <Link href={PUBLIC_ROUTES.contact}>
              Konsultasi Gratis
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
