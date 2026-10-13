import { FadeUp } from "@/components/shared/motion";

export function PricingHero() {
  return (
    <section className="editorial-surface">
      <div className="public-container-px mx-auto max-w-screen-xxxl py-10 text-center sm:py-14">
        <FadeUp>
          <div className="editorial-kicker mx-auto border-black/20 text-black/60">
            Harga
          </div>
          <h1 className="editorial-display mx-auto mt-6 max-w-4xl text-5xl text-balance sm:text-6xl lg:text-7xl">
            Harga transparan, tanpa kejutan
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-black/60">
            Pilih paket yang cocok dengan fase bisnis Anda. Semua harga sudah
            mencakup pajak.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
