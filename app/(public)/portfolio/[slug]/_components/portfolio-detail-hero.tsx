import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { FadeUp } from "@/components/shared/motion";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import shared from "../../../_components/studio.module.css";
import type { PortfolioDetail } from "../../_data/portfolio";
import { PortfolioFeaturedImage } from "./portfolio-featured-image";
import styles from "./portfolio-detail.module.css";

type PortfolioDetailHeroProps = {
  item: PortfolioDetail;
  featuredImage: string | null;
};

export function PortfolioDetailHero({
  item,
  featuredImage,
}: PortfolioDetailHeroProps) {
  return (
    <section className={styles.hero} aria-labelledby="case-study-heading">
      <div className={shared.container}>
        <Link href={PUBLIC_ROUTES.portfolio} className={styles.backLink}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke Portfolio
        </Link>
        <div className={cn(styles.heroGrid, !featuredImage && styles.textOnly)}>
          <FadeUp className={styles.heroCopy}>
            <p className={styles.eyebrow}>Studi kasus / Aldera Tech</p>
            <span className={styles.industry}>{item.industry}</span>
            <h1 id="case-study-heading">{item.title}</h1>
            <p className={styles.summary}>{item.summary}</p>
            <div className={styles.clientInfo}>
              <span className={styles.clientIcon} aria-hidden="true">
                <Building2 className="size-5" strokeWidth={1.5} />
              </span>
              <div>
                <span>Klien</span>
                <strong>{item.client}</strong>
              </div>
            </div>
          </FadeUp>
          {featuredImage && (
            <FadeUp delay={0.1} className={styles.heroVisual}>
              <PortfolioFeaturedImage src={featuredImage} alt={item.title} />
            </FadeUp>
          )}
        </div>
      </div>
    </section>
  );
}
