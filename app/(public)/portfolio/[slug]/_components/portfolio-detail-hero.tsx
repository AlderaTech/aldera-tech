import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/shared/motion";
import { PUBLIC_ROUTES } from "@/lib/routes";
import type { PortfolioDetail } from "../../_data/portfolio";

type PortfolioDetailHeroProps = {
  item: PortfolioDetail;
};

export function PortfolioDetailHero({ item }: PortfolioDetailHeroProps) {
  return (
    <section className="editorial-surface">
      <div className="public-container-px mx-auto max-w-screen-xxxl py-10">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link href={PUBLIC_ROUTES.portfolio}>
            <ArrowLeft className="size-4" /> Kembali ke Portfolio
          </Link>
        </Button>
        <FadeUp>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{item.industry}</Badge>
            <span className="text-sm text-black/62">{item.client}</span>
          </div>
          <h1 className="editorial-display max-w-5xl text-5xl text-balance sm:text-6xl lg:text-7xl">
            {item.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg text-black/60">{item.summary}</p>
        </FadeUp>
      </div>
    </section>
  );
}
