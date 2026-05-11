import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/shared/motion";
import { PUBLIC_ROUTES } from "@/lib/routes";

const proposalSteps = [
  "Peta cakupan dan prioritas fitur",
  "Estimasi waktu dan anggaran",
  "Roadmap sprint pertama",
];

export function CtaSection() {
  return (
    <section className="editorial-surface">
      <div className="mx-auto max-w-screen-xxxl public-container-px py-14 sm:py-20">
      <FadeUp>
        <div className="overflow-hidden rounded-xl border border-black bg-[#08090d] text-white shadow-2xl">
          <div className="grid gap-8 p-6 sm:p-10 lg:min-h-[340px] lg:grid-cols-[1fr_0.62fr] lg:items-center lg:p-12">
            <div className="lg:self-center">
              <div className="editorial-kicker border-white/20 text-white/64">
                <CheckCircle2 className="size-3.5 text-[#0b6bff]" />
                Proposal awal dalam 1x24 jam
              </div>
              <h2 className="editorial-display mt-6 max-w-4xl text-4xl text-balance sm:text-5xl lg:text-6xl">
                Siap mulai proyek Anda?
              </h2>
              <p className="mt-5 max-w-2xl text-white/72">
                Konsultasi 30 menit gratis, mari diskusikan ide Anda dan lihat
                bagaimana kami bisa membantu mewujudkannya.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4 shadow-2xl">
              <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-[#0b6bff] p-4 text-white">
                  <div className="text-2xl font-black">30m</div>
                  <div className="text-white/70">Sesi discovery</div>
                </div>
                <div className="rounded-lg border border-white/10 p-4">
                  <div className="text-2xl font-black">1x24</div>
                  <div className="text-white/64">Respon awal</div>
                </div>
              </div>
              <div className="mb-5 space-y-2 rounded-lg border border-white/10 bg-black/20 p-3">
                {proposalSteps.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center justify-between gap-3 rounded-md bg-white/[0.04] px-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <CheckCircle2 className="size-4 shrink-0 text-[#0b6bff]" />
                      <span className="truncate text-sm text-white/72">
                        {step}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-white/50">
                      0{index + 1}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
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
              <Button asChild size="xl" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white">
                <Link href={PUBLIC_ROUTES.pricing}>
                  Lihat Harga
                </Link>
              </Button>
            </div>
            </div>
          </div>
        </div>
      </FadeUp>
      </div>
    </section>
  );
}
