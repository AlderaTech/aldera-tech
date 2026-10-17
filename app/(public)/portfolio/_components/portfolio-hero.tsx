import { ArrowDown, ArrowUpRight } from "lucide-react";
import { FadeUp } from "@/components/shared/motion";
import { cn } from "@/lib/utils";
import shared from "../../_components/studio.module.css";
import type { PortfolioItem } from "../_data/portfolio";
import { PortfolioHeroVisual } from "./portfolio-hero-visual";
import styles from "./portfolio-page.module.css";

type PortfolioHeroProps = {
  items: PortfolioItem[];
};

export function PortfolioHero({ items }: PortfolioHeroProps) {
  return (
    <section className={styles.hero} aria-labelledby="portfolio-heading">
      <div className={cn(shared.container, styles.heroContainer)}>
        <FadeUp className={styles.heroLabel}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" />
            Portofolio Aldera Tech
          </p>
        </FadeUp>

        <FadeUp delay={0.1} className={styles.visualWrap}>
          <PortfolioHeroVisual items={items} />
        </FadeUp>

        <FadeUp className={styles.heroCopy}>
          <p className={styles.heroDescription}>
            Dari startup ke korporat, inilah kolaborasi yang telah kami bangun
            bersama klien kami.
          </p>
          <a className={styles.exploreLink} href="#daftar-proyek">
            Jelajahi proyek
            <ArrowDown className="size-4" aria-hidden="true" />
          </a>
        </FadeUp>

        <div className={styles.heroFootnote}>
          <span>Studi kasus pilihan</span>
          <span aria-hidden="true" className={styles.heroFootnoteLine} />
          <a href="#daftar-proyek">
            Lihat seluruh proyek{" "}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
