import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/shared/motion";
import { PUBLIC_ROUTES } from "@/lib/routes";
import shared from "../../_components/studio.module.css";
import type { PortfolioItem } from "../_data/portfolio";
import { PortfolioCard } from "./portfolio-card";
import styles from "./portfolio-grid.module.css";

type PortfolioGridProps = {
  items: PortfolioItem[];
};

export function PortfolioGrid({ items }: PortfolioGridProps) {
  return (
    <section
      id="daftar-proyek"
      className={styles.section}
      aria-labelledby="portfolio-list-heading"
    >
      <div className={shared.container}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Karya terpilih / Aldera Tech</p>
            <h2 id="portfolio-list-heading">
              Setiap proyek punya <span>ceritanya.</span>
            </h2>
          </div>
          <div className={styles.headerAside}>
            <p>
              Telusuri proyek yang telah dipublikasikan dan lihat solusi di
              balik setiap karya.
            </p>
            <Link href={PUBLIC_ROUTES.contact} className={styles.contactLink}>
              Diskusikan proyek Anda
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <StaggerContainer className={styles.grid}>
          {items.map((item) => (
            <StaggerItem key={item.slug} className={styles.gridItem}>
              <PortfolioCard item={item} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
