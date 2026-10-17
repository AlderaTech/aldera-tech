import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PUBLIC_ROUTES } from "@/lib/routes";
import type { PortfolioItem } from "../_data/portfolio";
import { PortfolioImage } from "./portfolio-image";
import styles from "./portfolio-grid.module.css";

type PortfolioCardProps = {
  item: PortfolioItem;
};

export function PortfolioCard({ item }: PortfolioCardProps) {
  return (
    <Link
      href={PUBLIC_ROUTES.portfolioDetail(item.slug)}
      className={styles.card}
    >
      <div className={styles.media}>
        <PortfolioImage
          src={item.featuredImage}
          alt={`Pratinjau proyek ${item.title}`}
          sizes="(min-width: 1280px) 400px, (min-width: 768px) 48vw, 95vw"
          imageClassName={styles.image}
          fallbackClassName={styles.imageFallback}
        />
        <span className={styles.industry}>{item.industry}</span>
        <span className={styles.openIcon} aria-hidden="true">
          <ArrowUpRight className="size-4" />
        </span>
      </div>

      <div className={styles.cardBody}>
        <p className={styles.client}>{item.client}</p>
        <h3>{item.title}</h3>
        <p className={styles.summary}>{item.summary}</p>
        <div className={styles.techStack} aria-label="Teknologi yang digunakan">
          {item.techStack.slice(0, 3).map((tech) => (
            <span key={tech}>{tech}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
