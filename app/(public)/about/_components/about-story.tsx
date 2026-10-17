import { CircleHelp, Eye, HeartHandshake } from "lucide-react";
import { FadeUp } from "@/components/shared/motion";
import { cn } from "@/lib/utils";
import { AboutStoryStep } from "./about-story-step";
import { AboutStoryVisual } from "./about-story-visual";
import shared from "../../_components/studio.module.css";
import styles from "./about-story.module.css";

export function AboutStory() {
  return (
    <section
      className={cn(shared.section, styles.section)}
      aria-labelledby="about-story-heading"
    >
      <div className={shared.container}>
        <div className={styles.content}>
          <FadeUp className={styles.header}>
            <p className={cn(shared.eyebrow, styles.eyebrow)}>Cerita Kami</p>
            <h2 id="about-story-heading" className={styles.heading}>
              Dari frustasi, <span>lahirlah solusi.</span>
            </h2>
          </FadeUp>
          <div className={styles.body}>
            <FadeUp className="min-w-0">
              <AboutStoryVisual />
            </FadeUp>
            <FadeUp delay={0.1} className={styles.steps}>
              <AboutStoryStep
                icon={CircleHelp}
                title="Tantangan yang kami lihat"
              >
                Bertahun-tahun bekerja sebagai pengembang dan desainer untuk
                startup dan korporat, kami sering melihat pola yang sama: klien
                tidak tahu apa yang sedang dikerjakan tim teknis, invoice yang
                tidak terduga, dan proyek yang molor tanpa penjelasan.
              </AboutStoryStep>
              <AboutStoryStep
                icon={Eye}
                title="Prinsip yang kami bawa"
                emphasized
              >
                Kami pikir, ini bisa lebih baik. Aldera Tech dibangun dengan
                prinsip <strong>transparansi radikal</strong>. Setiap klien
                mendapat akses dashboard langsung. Setiap milestone
                dikomunikasikan. Setiap invoice punya rincian jelas.
              </AboutStoryStep>
              <AboutStoryStep
                icon={HeartHandshake}
                title="Perjalanan bersama mitra"
              >
                Hari ini, kami melayani 30+ klien dari UMKM sampai korporat,
                membuktikan bahwa freelance bisa profesional sekaligus humanis.
              </AboutStoryStep>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
