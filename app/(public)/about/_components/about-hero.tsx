import Image from "next/image";
import { FadeUp } from "@/components/shared/motion";

export function AboutHero() {
  return (
    <section className="bg-background text-foreground">
      <div className="public-container-px mx-auto max-w-screen-xxxl py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <FadeUp className="space-y-5">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-bold tracking-[0.08em] text-muted-foreground uppercase">
              Tentang Kami
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-balance text-[#0F263A] sm:text-5xl lg:text-6xl">
              Kami bantu bisnis Indonesia{" "}
              <span className="text-[#00B1E1]">bertumbuh</span> lewat produk
              digital yang bekerja.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Aldera Tech didirikan dari keyakinan sederhana, bahwa bisnis
              Indonesia layak mendapat produk digital yang sama kualitasnya
              dengan yang dibuat Silicon Valley, tapi tanpa harga yang menyakiti
              dompet.
            </p>
          </FadeUp>
          <FadeUp delay={0.1} className="relative">
            <div className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
              <Image
                src="/images/about/about-studio.webp"
                alt="Studio kolaborasi produk digital Aldera Tech"
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
