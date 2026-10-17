import Link from "next/link";
import { ArrowUpRight, Compass } from "lucide-react";
import { FadeUp } from "@/components/shared/motion";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { ServicesShowcase } from "./services-showcase";
import shared from "../studio.module.css";
import styles from "./services-intro.module.css";

export function ServicesIntro() {
  return (
    <section
      className={styles.section}
      aria-labelledby="services-intro-heading"
    >
      <div className={shared.container}>
        <div className={styles.layout}>
          <FadeUp className={styles.copy}>
            <p className={styles.eyebrow}>
              <Compass
                className="size-4"
                strokeWidth={1.5}
                aria-hidden="true"
              />
              Dirancang untuk langkah berikutnya
            </p>
            <h2 id="services-intro-heading" className={styles.heading}>
              Solusi digital untuk <span>pertumbuhan</span> bisnis Anda.
            </h2>
            <p className={styles.description}>
              Dari website, aplikasi mobile, hingga UI/UX, kami menyatukan{" "}
              <strong>strategi, desain, dan rekayasa</strong> dalam proses
              pengembangan yang terarah.
            </p>
            <div className={styles.actions}>
              <Link
                href={PUBLIC_ROUTES.services}
                className={cn(shared.blueButton, styles.primaryCta)}
              >
                Jelajahi Layanan{" "}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href={PUBLIC_ROUTES.portfolio}
                className={cn(shared.outlineLink, styles.portfolioLink)}
              >
                Lihat Portfolio
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </FadeUp>
          <FadeUp delay={0.1} className={styles.visual}>
            <ServicesShowcase />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
