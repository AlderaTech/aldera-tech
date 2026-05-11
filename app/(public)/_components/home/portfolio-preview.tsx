import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion";
import { prisma } from "@/lib/prisma";
import { publicCaseStudies, resolveCaseStudyImage } from "@/lib/public-fallbacks";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { safeDb } from "@/lib/safe-db";

type HomeCaseStudy = {
  slug: string;
  title: string;
  client: string;
  industry: string;
  featuredImage: string | null;
};

const fallback: HomeCaseStudy[] = publicCaseStudies.slice(0, 3).map((item) => ({
  slug: item.slug,
  title: item.title,
  client: item.client,
  industry: item.industry,
  featuredImage: item.featuredImage,
}));

export async function PortfolioPreview() {
  const items = await safeDb<HomeCaseStudy[]>(async () => {
    const data = await prisma.caseStudy.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      take: 3,
      select: {
        slug: true,
        title: true,
        client: true,
        industry: true,
        featuredImage: true,
      },
    });
    return data.length
      ? data.map((item) => ({
          ...item,
          featuredImage: resolveCaseStudyImage(item.slug, item.featuredImage),
        }))
      : fallback;
  }, fallback);

  return (
    <section className="editorial-surface h-[calc(100dvh-72px)] overflow-hidden">
      <div className="mx-auto flex h-full max-w-screen-xxxl flex-col justify-center public-container-px py-8 sm:py-10">
        <FadeUp className="mb-6 grid gap-5 lg:grid-cols-[0.8fr_1fr] lg:items-end">
          <div className="max-w-2xl">
            <div className="editorial-kicker border-black/20 text-black/60">
              Portfolio
            </div>
            <h2 className="editorial-display mt-4 text-4xl text-balance sm:text-5xl lg:text-6xl">
              Proyek terbaru yang kami banggakan
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-relaxed text-black/60 lg:justify-self-end">
            Preview produk dibuat sebagai studi visual: layar, alur, dan
            konteks bisnis terlihat sejak kartu pertama.
          </p>
        </FadeUp>

        <StaggerContainer className="grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <StaggerItem key={item.slug}>
              <Link
                href={PUBLIC_ROUTES.portfolioDetail(item.slug)}
                className="group block h-full"
              >
                <Card className="h-full overflow-hidden rounded-xl border-black/10 bg-[#08090d] p-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#08090d] xl:aspect-[16/11]">
                    {item.featuredImage ? (
                      <Image
                        src={item.featuredImage}
                        alt={item.title}
                        fill
                        sizes="(min-width: 1024px) 31vw, (min-width: 768px) 33vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                        No image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/24 to-transparent" />
                    <div className="absolute left-3 top-3">
                      <Badge className="bg-[#0b6bff] text-white hover:bg-[#0b6bff]">
                        {item.industry}
                      </Badge>
                    </div>
                    <div className="absolute right-3 top-3 flex size-9 translate-y-1 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white opacity-0 backdrop-blur transition-all group-hover:translate-y-0 group-hover:opacity-100">
                      <ArrowUpRight className="size-4" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                      <div className="mb-2 text-xs uppercase text-white/64">
                        {item.client}
                      </div>
                      <h3 className="text-2xl font-black leading-tight text-balance lg:text-3xl">
                        {item.title}
                      </h3>
                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white/80">
                        Buka detail portfolio
                        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 border-t border-white/10 bg-[#08090d] text-xs text-white/64">
                    {["Cakupan", "Proses", "Rilis"].map((label) => (
                      <div
                        key={label}
                        className="border-r border-white/10 px-4 py-3 last:border-r-0"
                      >
                        <div className="font-bold text-white">{label}</div>
                        <div className="mt-0.5">Alur proyek</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeUp className="mt-6 flex justify-center">
          <Button asChild className="bg-[#08090d] text-white hover:bg-black">
            <Link href={PUBLIC_ROUTES.portfolio}>
              Semua portfolio
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </FadeUp>
      </div>
    </section>
  );
}
