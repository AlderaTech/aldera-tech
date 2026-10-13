import { StaggerContainer, StaggerItem } from "@/components/shared/motion";
import type { PortfolioItem } from "../_data/portfolio";
import { PortfolioCard } from "./portfolio-card";

type PortfolioGridProps = {
  items: PortfolioItem[];
};

export function PortfolioGrid({ items }: PortfolioGridProps) {
  return (
    <section className="editorial-surface">
      <div className="public-container-px mx-auto max-w-screen-xxxl py-14 sm:py-20">
        <StaggerContainer className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <StaggerItem key={item.slug}>
              <PortfolioCard item={item} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
