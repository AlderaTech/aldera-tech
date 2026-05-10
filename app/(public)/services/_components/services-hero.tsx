import Image from "next/image";
import { FadeUp } from "@/components/shared/motion";

export function ServicesHero() {
  return (
    <section className="editorial-ink">
      <div className="mx-auto grid max-w-screen-xxxl gap-4 public-container-px py-10 sm:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <FadeUp>
          <div className="editorial-kicker border-white/20 text-white/55">
            Layanan
          </div>
          <h1 className="editorial-display mt-6 max-w-3xl text-5xl text-balance sm:text-6xl lg:text-7xl">
            Solusi menyeluruh untuk kebutuhan digital Anda
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/62">
            Dari ide hingga rilis, dari rilis hingga bertumbuh. Pilih yang
            paling cocok untuk fase bisnis Anda sekarang.
          </p>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10 shadow-2xl">
            <Image
              src="/generated/solvo-tech/services-blue-suite.png"
              alt="Mockup layanan web, mobile, dan e-commerce"
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
