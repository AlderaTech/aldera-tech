import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";
import mascot from "@/public/images/portfolio/aldera-cat-portfolio.webp";
import type { PortfolioItem } from "../_data/portfolio";
import { PortfolioImage } from "./portfolio-image";
import styles from "./portfolio-page.module.css";

type PortfolioHeroVisualProps = {
  items: PortfolioItem[];
};

function ProjectPanel({
  item,
  position,
}: {
  item: PortfolioItem;
  position: "left" | "right";
}) {
  if (!item.featuredImage) return null;

  return (
    <Link
      href={PUBLIC_ROUTES.portfolioDetail(item.slug)}
      className={cn(styles.projectPanel, styles[position])}
      aria-label={`Lihat proyek ${item.title}`}
    >
      <span className={styles.panelChrome} aria-hidden="true">
        <i /> <i /> <i />
        <span>{item.industry}</span>
      </span>
      <span className={styles.panelMedia}>
        <PortfolioImage
          src={item.featuredImage}
          alt={`Pratinjau proyek ${item.title}`}
          sizes="(min-width: 1280px) 224px, 200px"
          imageClassName={styles.panelImage}
          fallbackClassName={styles.panelImageFallback}
        />
      </span>
      <span className={styles.panelFooter}>
        <strong>{item.title}</strong>
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </span>
    </Link>
  );
}

export function PortfolioHeroVisual({ items }: PortfolioHeroVisualProps) {
  const [primary, secondary] = items
    .filter((item) => item.featuredImage)
    .slice(0, 2);

  return (
    <div className={styles.scene}>
      <h1 id="portfolio-heading" className={styles.heroTitle}>
        Proyek yang kami <span>banggakan</span>
      </h1>
      <span className={styles.sceneHalo} aria-hidden="true" />
      <span className={styles.sceneRing} aria-hidden="true" />
      <span className={styles.sceneGround} aria-hidden="true" />

      {primary && <ProjectPanel item={primary} position="left" />}
      {secondary && <ProjectPanel item={secondary} position="right" />}

      <div className={styles.mascot}>
        <Image
          src={mascot}
          alt="Maskot kucing putih Aldera Tech berkacamata hitam dan berheadphone, berdiri di tengah sambil membuka kedua tangan untuk menyambut pengunjung"
          fill
          preload
          sizes="(min-width: 640px) clamp(171px, calc(67vh - 208px), 384px), (max-height: 700px) 27vh, 256px"
          quality={90}
          className={styles.mascotImage}
        />
      </div>
    </div>
  );
}
