import Image from "next/image";
import { FadeUp } from "@/components/shared/motion";

export function ContactHero({ responseTime }: { responseTime: string }) {
  return (
    <section className="editorial-ink">
      <div className="public-container-px mx-auto grid max-w-screen-xxxl gap-4 py-10 sm:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <FadeUp>
          <div className="editorial-kicker border-white/20 text-white/64">
            Kontak
          </div>
          <h1 className="editorial-display mt-6 max-w-3xl text-5xl text-balance sm:text-6xl lg:text-7xl">
            Mari bicara tentang proyek Anda
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/72">
            Konsultasi 30 menit pertama gratis. Ceritakan kebutuhan Anda, kami
            akan merespons dalam {responseTime}.
          </p>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10 shadow-2xl">
            <Image
              src="/generated/solvo-tech/contact-blue-console.png"
              alt="Mockup dashboard konsultasi proyek Solvo Tech"
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
