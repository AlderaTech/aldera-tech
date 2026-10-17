import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { FadeUp } from "@/components/shared/motion";
import { PUBLIC_ROUTES } from "@/lib/routes";
import shared from "../../_components/studio.module.css";
import styles from "./services.module.css";

export function ServicesCta() {
  return (
    <section
      className={styles.ctaSection}
      aria-labelledby="services-cta-heading"
    >
      <div className={shared.container}>
        <FadeUp>
          <div className={styles.ctaPanel}>
            <div className={styles.ctaContent}>
              <p className={styles.ctaEyebrow}>
                <Sparkles aria-hidden="true" />
                Langkah digital berikutnya
              </p>
              <h2 id="services-cta-heading">Butuh paket custom?</h2>
              <p>
                Setiap bisnis unik. Kami siap mendesain solusi yang persis
                sesuai kebutuhan Anda.
              </p>
              <Link href={PUBLIC_ROUTES.contact} className={styles.ctaLink}>
                Konsultasi Gratis
                <ArrowUpRight aria-hidden="true" />
              </Link>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
