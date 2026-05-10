import Image from "next/image";
import { FadeUp } from "@/components/shared/motion";

export function AboutHero() {
  return (
    <section className="editorial-surface">
      <div className="mx-auto max-w-screen-xxxl public-container-px py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <FadeUp className="space-y-5">
            <div className="editorial-kicker border-black/20 text-black/60">
              Tentang Kami
            </div>
            <h1 className="editorial-display text-5xl text-balance sm:text-6xl lg:text-7xl">
              Kami bantu bisnis Indonesia{" "}
              <span className="text-[#0b6bff]">bertumbuh</span> lewat produk
              digital yang bekerja.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-black/62">
              Solvo Tech didirikan dari keyakinan sederhana, bahwa bisnis
              Indonesia layak mendapat produk digital yang sama kualitasnya
              dengan yang dibuat Silicon Valley, tapi tanpa harga yang menyakiti
              dompet.
            </p>
          </FadeUp>
          <FadeUp delay={0.1} className="relative">
            <div className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-xl border border-black/10 bg-background shadow-2xl">
              <Image
                src="/generated/solvo-tech/about-blue-studio-v2.png"
                alt="Studio kolaborasi produk digital Solvo Tech"
                fill
                sizes="(min-width: 1024px) 520px, 100vw"
                className="object-cover"
              />
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
