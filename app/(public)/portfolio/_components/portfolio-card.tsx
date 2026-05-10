import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PUBLIC_ROUTES } from "@/lib/routes";
import type { PortfolioItem } from "../_data/portfolio";

type PortfolioCardProps = {
  item: PortfolioItem;
};

export function PortfolioCard({ item }: PortfolioCardProps) {
  return (
    <Link
      href={PUBLIC_ROUTES.portfolioDetail(item.slug)}
      className="block h-full group"
    >
      <Card className="h-full overflow-hidden rounded-xl p-0 transition-all hover:-translate-y-1 hover:shadow-2xl">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {item.featuredImage ? (
            <Image
              src={item.featuredImage}
              alt={item.title}
              fill
              sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
          <div className="absolute left-3 top-3 flex gap-2">
            <Badge className="bg-[#0b6bff] text-white hover:bg-[#0b6bff]">
              {item.industry}
            </Badge>
          </div>
          <div className="absolute bottom-3 right-3 flex size-9 translate-y-2 items-center justify-center rounded-full bg-white text-black opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="size-4" />
          </div>
        </div>
        <div className="space-y-3 bg-white/80 p-5">
          <div className="text-xs uppercase text-black/45">{item.client}</div>
          <h2 className="text-xl font-black leading-snug transition-colors group-hover:text-[#0b6bff]">
            {item.title}
          </h2>
          <p className="line-clamp-2 text-sm text-black/60">{item.summary}</p>
          <div className="flex flex-wrap gap-1 pt-2">
            {item.techStack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="rounded-md bg-black/5 px-2 py-0.5 text-xs text-black/58"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  );
}
