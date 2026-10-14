import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/shared/motion";
import { PUBLIC_ROUTES } from "@/lib/routes";

const proposalSteps = [
  "Pemetaan cakupan & prioritas fitur",
  "Estimasi waktu delivery & investasi",
  "Roadmap sprint pertama yang terukur",
];

export function CtaSection() {
  return (
    <section className="bg-[#F8FAFC] py-16 sm:py-24">
      <div className="public-container-px mx-auto max-w-screen-xxxl">
        <FadeUp>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0F263A] p-8 text-white shadow-2xl shadow-slate-900/15 sm:p-12 lg:p-16">
            {/* Ambient radial cyan glow inside container */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(0,177,225,0.25)_0%,transparent_70%)] blur-2xl" />

            <div className="relative z-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold tracking-wider text-[#00B1E1] uppercase">
                  <CheckCircle2 className="size-3.5 text-[#00B1E1]" />
                  Proposal Awal dalam 1x24 Jam
                </div>
                <h2 className="mt-6 font-serif text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Siap Memulai Proyek Digital Anda?
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                  Konsultasi 30 menit pertama gratis. Diskusikan ide,
                  arsitektur, dan timeline produk Anda bersama tim engineering
                  kami.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Button
                    asChild
                    size="xl"
                    className="group rounded-full bg-[#00B1E1] px-8 text-base font-bold text-[#0F263A] shadow-xl shadow-[#00B1E1]/25 transition-all hover:scale-[1.02] hover:bg-[#0094BD]"
                  >
                    <Link href={PUBLIC_ROUTES.contact}>
                      Konsultasi Gratis
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="xl"
                    variant="outline"
                    className="rounded-full border-2 border-white/25 bg-white/5 px-8 text-base font-bold text-white transition-all hover:bg-white/15 hover:text-white"
                  >
                    <Link href={PUBLIC_ROUTES.pricing}>
                      Hitung Estimasi Harga
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right: Metrics & Proposal Guarantee */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-md sm:p-8">
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-[#00B1E1]/30 bg-[#00B1E1]/15 p-5">
                    <div className="font-serif text-3xl font-black text-[#00B1E1]">
                      30m
                    </div>
                    <div className="mt-1 text-xs font-semibold tracking-wider text-slate-200 uppercase">
                      Sesi Discovery
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5">
                    <div className="font-serif text-3xl font-black text-white">
                      1x24
                    </div>
                    <div className="mt-1 text-xs font-semibold tracking-wider text-slate-300 uppercase">
                      Respon Awal
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-bold tracking-wider text-slate-300 uppercase">
                    Yang Anda Dapatkan di Sesi Pertama:
                  </div>
                  {proposalSteps.map((step, index) => (
                    <div
                      key={step}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-medium text-slate-200"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="size-4 shrink-0 text-[#00B1E1]" />
                        <span>{step}</span>
                      </div>
                      <span className="shrink-0 font-mono text-[11px] font-bold text-[#00B1E1]">
                        0{index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
