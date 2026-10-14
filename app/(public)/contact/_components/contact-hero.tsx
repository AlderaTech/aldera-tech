import Image from "next/image";
import { FadeUp } from "@/components/shared/motion";

export function ContactHero({ responseTime }: { responseTime: string }) {
  return (
    <section className="bg-[#0F263A] text-white">
      <div className="public-container-px mx-auto grid max-w-screen-xxxl gap-4 py-10 sm:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <FadeUp>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold tracking-[0.08em] text-[#00B1E1] uppercase">
            Kontak
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
            Mari bicara tentang proyek Anda
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            Konsultasi 30 menit pertama gratis. Ceritakan kebutuhan Anda, kami
            akan merespons dalam {responseTime}.
          </p>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/15 shadow-2xl">
            <Image
              src="/images/contact/contact-console.webp"
              alt="Mockup dashboard konsultasi proyek Aldera Tech"
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
