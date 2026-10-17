import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Code2,
  Palette,
  Smartphone,
} from "lucide-react";
import { FadeUp } from "@/components/shared/motion";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import mascot from "@/public/images/services/aldera-cat-services.webp";
import shared from "../../_components/studio.module.css";
import styles from "./services.module.css";

export function ServicesHero() {
  return (
    <section className={styles.hero} aria-labelledby="services-heading">
      <div className={styles.heroBackdrop} aria-hidden="true" />
      <div className={cn(shared.container, styles.heroGrid)}>
        <FadeUp className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" />
            Layanan Aldera Tech
          </p>
          <h1 id="services-heading">
            Solusi menyeluruh untuk kebutuhan <span>digital Anda.</span>
          </h1>
          <p className={styles.heroDescription}>
            Dari ide hingga rilis, dari rilis hingga bertumbuh. Pilih yang
            paling cocok untuk fase bisnis Anda sekarang.
          </p>
          <div className={styles.heroActions}>
            <Link href={PUBLIC_ROUTES.contact} className={shared.blueButton}>
              Konsultasi Gratis
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
            <a href="#pilihan-layanan" className={shared.outlineLink}>
              Jelajahi Layanan
              <ArrowDown className="size-4" aria-hidden="true" />
            </a>
          </div>
          <div className={styles.heroNote}>
            <span className={styles.heroNoteRule} aria-hidden="true" />
            <p>Ruang lingkup jelas, dari rancangan hingga serah terima.</p>
          </div>
        </FadeUp>

        <FadeUp delay={0.1} className={styles.visualColumn}>
          <div className={styles.mascotStage}>
            <span className={styles.backdropWord} aria-hidden="true">
              DIGITAL
            </span>
            <span className={styles.orbit} aria-hidden="true" />
            <svg
              className={styles.connection}
              viewBox="0 0 520 520"
              fill="none"
              aria-hidden="true"
            >
              <path d="M28 135h90l38 40m334 74h-72l-42 40M70 414h92l36-38" />
              <circle cx="28" cy="135" r="3" />
              <circle cx="490" cy="249" r="3" />
              <circle cx="70" cy="414" r="3" />
            </svg>
            <span className={styles.mascotShadow} aria-hidden="true" />
            <div className={styles.mascot}>
              <Image
                src={mascot}
                alt="Maskot kucing putih Aldera Tech membawa laptop terbuka sambil menjelaskan rancangan solusi digital, dengan kacamata hitam, headphone biru, dan hoodie putih bergaris merah-biru"
                fill
                sizes="(min-width: 1024px) 400px, (min-width: 640px) 360px, 75vw"
                quality={90}
                className={styles.mascotImage}
                preload
              />
            </div>

            <div className={cn(styles.floatBadge, styles.badgeEngineering)}>
              <span>
                <Code2 aria-hidden="true" />
              </span>
              <div>
                <strong>Web Development</strong>
                <small>Engineering</small>
              </div>
            </div>
            <div className={cn(styles.floatBadge, styles.badgeDesign)}>
              <span>
                <Palette aria-hidden="true" />
              </span>
              <div>
                <strong>UI/UX Design</strong>
                <small>Pengalaman digital</small>
              </div>
            </div>
            <div className={cn(styles.floatBadge, styles.badgeMobile)}>
              <span>
                <Smartphone aria-hidden="true" />
              </span>
              <div>
                <strong>Mobile Apps</strong>
                <small>iOS & Android</small>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
