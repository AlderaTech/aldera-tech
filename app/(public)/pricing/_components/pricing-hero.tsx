import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Calculator, Check } from "lucide-react";
import { FadeUp } from "@/components/shared/motion";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import mascot from "@/public/images/about/aldera-cat-vision.webp";
import shared from "../../_components/studio.module.css";
import styles from "./pricing.module.css";

export function PricingHero() {
  return (
    <section className={styles.hero} aria-labelledby="pricing-heading">
      <div className={cn(shared.container, styles.heroGrid)}>
        <FadeUp className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" />
            Harga / Aldera Tech
          </p>
          <h1 id="pricing-heading">
            Harga transparan,
            <br />
            <span>tanpa kejutan.</span>
          </h1>
          <p className={styles.heroDescription}>
            Pilih paket yang cocok dengan fase bisnis Anda. Semua harga sudah
            mencakup pajak.
          </p>
          <div className={styles.heroActions}>
            <a href="#pricing-plans" className={shared.blueButton}>
              Jelajahi Paket
              <ArrowDown className="size-4" aria-hidden="true" />
            </a>
            <Link
              href={PUBLIC_ROUTES.calculator}
              className={shared.outlineLink}
            >
              <Calculator className="size-4" aria-hidden="true" />
              Hitung Estimasi
            </Link>
          </div>
        </FadeUp>
        <FadeUp delay={0.1} className={styles.heroGuide}>
          <span className={styles.guideGlow} aria-hidden="true" />
          <span className={styles.miniMascot} aria-hidden="true">
            <Image
              src={mascot}
              alt=""
              sizes="(min-width: 1024px) 128px, (min-width: 640px) 92px, 72px"
              quality={90}
            />
          </span>
          <div className={styles.guideCopy}>
            <span className={styles.guideLabel}>Rencanakan langkah Anda</span>
            <ol>
              <li>
                <span aria-hidden="true">01</span>Pilih paket
              </li>
              <li>
                <span aria-hidden="true">02</span>Sesuaikan cakupan
              </li>
              <li>
                <span aria-hidden="true">03</span>Diskusikan kebutuhan
              </li>
            </ol>
            <p>
              <Check className="size-3.5" aria-hidden="true" />
              Harga final sesuai cakupan proyek.
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
