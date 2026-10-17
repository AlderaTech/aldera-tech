import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FadeUp } from "@/components/shared/motion";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { AboutMascot } from "./about-mascot";
import shared from "../../_components/studio.module.css";
import styles from "./about.module.css";

export function AboutHero() {
  return (
    <section className={styles.hero} aria-labelledby="about-heading">
      <div className={shared.container}>
        <div className={styles.heroGrid}>
          <FadeUp className={styles.heroCopy}>
            <p className={cn(shared.eyebrow, styles.heroEyebrow)}>
              Tentang Kami / Aldera Tech
            </p>
            <h1 id="about-heading">
              <span className={styles.heroLead}>
                Kami bantu bisnis Indonesia
              </span>{" "}
              <span className={styles.heroEmphasis}>bertumbuh</span>{" "}
              <span className={styles.heroClosing}>
                lewat produk digital yang bekerja.
              </span>
            </h1>
            <p className={cn(shared.description, styles.heroDescription)}>
              Aldera Tech didirikan dari keyakinan sederhana, bahwa bisnis
              Indonesia layak mendapat produk digital yang sama kualitasnya
              dengan yang dibuat Silicon Valley, tapi tanpa harga yang menyakiti
              dompet.
            </p>
            <div className={styles.heroActions}>
              <Link href={PUBLIC_ROUTES.contact} className={shared.blueButton}>
                Diskusikan Ide Anda{" "}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href={PUBLIC_ROUTES.portfolio}
                className={shared.outlineLink}
              >
                Lihat Portfolio
              </Link>
            </div>
          </FadeUp>
          <FadeUp delay={0.1} className="min-w-0">
            <AboutMascot />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
