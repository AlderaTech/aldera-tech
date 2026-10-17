import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight } from "lucide-react";
import { FadeUp } from "@/components/shared/motion";
import { PUBLIC_ROUTES } from "@/lib/routes";
import mascot from "@/public/images/contact/aldera-cat-contact.webp";
import shared from "../../_components/studio.module.css";
import styles from "./contact.module.css";

export function ContactHero({ responseTime }: { responseTime: string }) {
  return (
    <section className={styles.hero} aria-labelledby="contact-heading">
      <div className={shared.container}>
        <div className={styles.heroGrid}>
          <FadeUp className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span aria-hidden="true" /> Kontak / Aldera Tech
            </p>
            <h1 id="contact-heading">
              Mari bicara tentang <span>proyek Anda.</span>
            </h1>
            <p className={styles.heroDescription}>
              Ceritakan kebutuhan digital Anda. Konsultasi 30 menit pertama
              gratis, dan tim kami akan merespons dalam {responseTime}.
            </p>
            <Link
              href={`${PUBLIC_ROUTES.contact}#formulir-kontak`}
              className={styles.heroLink}
            >
              Tulis pesan kepada kami
              <ArrowDownRight className="size-4" aria-hidden="true" />
            </Link>
          </FadeUp>
          <FadeUp delay={0.1} className={styles.heroVisual}>
            <div className={styles.mascotStage} aria-hidden="true">
              <span className={styles.orbit} />
              <span className={styles.mascotShadow} />
              <Image
                src={mascot}
                alt=""
                fill
                sizes="(min-width: 1024px) 450px, (min-width: 640px) 340px, 260px"
                quality={85}
                className={styles.mascot}
                preload
              />
              <span className={styles.helloBadge}>
                Halo, ada yang bisa dibantu?
              </span>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
