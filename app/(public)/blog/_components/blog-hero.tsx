import { FadeUp } from "@/components/shared/motion";

export function BlogHero() {
  return (
    <section className="editorial-surface">
      <div className="mx-auto max-w-screen-xxxl public-container-px py-10 text-center sm:py-14">
        <FadeUp>
          <div className="editorial-kicker mx-auto border-black/20 text-black/60">
            Blog
          </div>
          <h1 className="editorial-display mx-auto mt-6 max-w-4xl text-5xl text-balance sm:text-6xl lg:text-7xl">
            Wawasan & cerita dari tim kami
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-black/60">
            Artikel tentang pengembangan, desain, dan strategi digital untuk
            bisnis modern.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
