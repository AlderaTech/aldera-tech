import { FadeUp } from "@/components/shared/motion";

export function AboutStory() {
  return (
    <section className="editorial-surface">
      <div className="public-container-px mx-auto max-w-screen-xxxl py-14 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <FadeUp>
            <div className="editorial-kicker border-black/20 text-black/60">
              Cerita Kami
            </div>
            <h2 className="editorial-display mt-5 text-4xl sm:text-5xl">
              Dari frustasi, lahirlah solusi.
            </h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="prose max-w-none prose-neutral">
              <p>
                Bertahun-tahun bekerja sebagai pengembang dan desainer untuk
                startup dan korporat, kami sering melihat pola yang sama: klien
                tidak tahu apa yang sedang dikerjakan tim teknis, invoice yang
                tidak terduga, dan proyek yang molor tanpa penjelasan.
              </p>
              <p>
                Kami pikir, ini bisa lebih baik. Solvo Tech dibangun dengan
                prinsip <strong>transparansi radikal</strong>. Setiap klien
                mendapat akses dashboard langsung. Setiap milestone
                dikomunikasikan. Setiap invoice punya rincian jelas.
              </p>
              <p>
                Hari ini, kami melayani 30+ klien dari UMKM sampai korporat,
                membuktikan bahwa freelance bisa profesional sekaligus humanis.
              </p>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
