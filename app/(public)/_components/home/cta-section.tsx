import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { FadeUp } from "@/components/shared/motion";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { TechGlobe } from "./tech-globe";
import shared from "../studio.module.css";
import styles from "./consultation-banner.module.css";

const proposalSteps = [
  "Pemetaan cakupan & prioritas fitur",
  "Estimasi waktu delivery & investasi",
  "Roadmap sprint pertama yang terukur",
];

export function CtaSection() {
  return (
    <section className={styles.section} aria-labelledby="consultation-heading">
      <div className={shared.container}>
        <FadeUp className={styles.panel}>
          <div className={styles.notch} aria-hidden="true" />
          <TechGlobe className={styles.globe} />
          <div className={styles.content}>
            <p className={styles.eyebrow}>Bersama, melangkah lebih jauh</p>
            <h2 id="consultation-heading">
              KEMBANGKAN BISNIS DENGAN TEKNOLOGI YANG TEPAT.
            </h2>
            <p>
              Konsultasi 30 menit pertama gratis. Diskusikan ide, arsitektur,
              dan timeline produk Anda bersama tim engineering kami.
            </p>
            <div className={styles.actions}>
              <Link href={PUBLIC_ROUTES.contact} className={styles.outline}>
                Diskusikan Proyek Anda{" "}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href={PUBLIC_ROUTES.pricing} className={styles.pricing}>
                Hitung Estimasi Harga{" "}
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className={styles.deliverables}>
            {proposalSteps.map((step) => (
              <span key={step}>
                <CheckCircle2
                  className="size-3.5 shrink-0"
                  aria-hidden="true"
                />
                {step}
              </span>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
