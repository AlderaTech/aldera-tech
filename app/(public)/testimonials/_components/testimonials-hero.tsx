import { FadeUp } from "@/components/shared/motion";

type TestimonialsHeroProps = {
  count: number;
};

export function TestimonialsHero({ count }: TestimonialsHeroProps) {
  return (
    <section className="editorial-ink">
      <div className="public-container-px mx-auto max-w-screen-xxxl py-10 text-center sm:py-14">
        <FadeUp>
          <div className="editorial-kicker mx-auto border-white/20 text-white/64">
            Testimoni
          </div>
          <h1 className="editorial-display mx-auto mt-6 max-w-4xl text-5xl text-balance sm:text-6xl lg:text-7xl">
            Kata klien kami
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/68">
            Sekitar {count}+ testimoni tulus dari bisnis yang telah
            mempercayakan proyek mereka ke Aldera Tech.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
