import Link from "next/link";
import { ArrowUpRight, MessagesSquare } from "lucide-react";
import { FadeUp } from "@/components/shared/motion";
import { PUBLIC_ROUTES } from "@/lib/routes";
import shared from "../../../_components/studio.module.css";
import styles from "./portfolio-detail.module.css";

export function PortfolioCta() {
  return (
    <section className={styles.ctaSection} aria-labelledby="case-cta-heading">
      <div className={shared.container}>
        <FadeUp className={styles.ctaPanel}>
          <span className={styles.ctaOrbit} aria-hidden="true" />
          <div className={styles.ctaHeading}>
            <span className={styles.ctaIcon} aria-hidden="true">
              <MessagesSquare className="size-5" strokeWidth={1.5} />
            </span>
            <p className={styles.eyebrow}>Mulai kolaborasi</p>
            <h2 id="case-cta-heading">
              Ingin <span>hasil serupa</span> untuk bisnis Anda?
            </h2>
          </div>
          <div className={styles.ctaCopy}>
            <p>
              Konsultasi 30 menit gratis. Ceritakan kebutuhan Anda dan kami
              buatkan proposal dalam 1x24 jam.
            </p>
            <div className={styles.ctaActions}>
              <Link href={PUBLIC_ROUTES.contact} className={shared.blueButton}>
                Konsultasi Gratis
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href={PUBLIC_ROUTES.portfolio}
                className={styles.otherProjects}
              >
                Lihat proyek lainnya
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
