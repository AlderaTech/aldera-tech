import Link from "next/link";
import { ArrowUpRight, MessagesSquare } from "lucide-react";
import { FadeUp } from "@/components/shared/motion";
import { PUBLIC_ROUTES } from "@/lib/routes";
import shared from "../../_components/studio.module.css";
import styles from "./about.module.css";

export function AboutCta() {
  return (
    <section className={styles.ctaSection} aria-labelledby="about-cta-heading">
      <div className={shared.container}>
        <FadeUp className={styles.ctaPanel}>
          <div className={styles.ctaHeading}>
            <span className={styles.ctaEyebrow}>
              <span aria-hidden="true" />
              Langkah berikutnya
            </span>
            <h2 id="about-cta-heading">
              <span className={styles.ctaTitleLead}>Mari</span>{" "}
              <span className={styles.ctaTitleFocus}>berkenalan</span>
            </h2>
            <span className={styles.ctaSignature} aria-hidden="true">
              Aldera Tech <span /> Digital Studio
            </span>
          </div>
          <div className={styles.ctaDetails}>
            <p>Kami senang mendengar ide Anda.</p>
            <div className={styles.ctaOffer}>
              <span className={styles.ctaOfferIcon} aria-hidden="true">
                <MessagesSquare className="size-5" strokeWidth={1.6} />
              </span>
              <span className={styles.ctaOfferCopy}>
                <strong>30 menit</strong>
                <span>Konsultasi gratis tanpa komitmen</span>
              </span>
              <span className={styles.ctaOfferIndex} aria-hidden="true">
                01
              </span>
            </div>
            <Link href={PUBLIC_ROUTES.contact} className={shared.outlineLink}>
              Konsultasi Gratis{" "}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
