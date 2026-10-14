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
import {
  publicCaseStudies,
  resolveCaseStudyImage,
} from "@/lib/public-fallbacks";
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
    <section className="bg-[#F8FAFC] py-16 sm:py-24">
      <div className="public-container-px mx-auto max-w-screen-xxxl">
        <FadeUp className="mb-12 grid gap-6 lg:grid-cols-[0.8fr_1fr] lg:items-end">
          <div>
            <div className="mb-4 h-1.5 w-12 rounded-full bg-[#00B1E1]" />
            <h2 className="font-serif text-3xl font-extrabold tracking-tight text-[#0F263A] sm:text-4xl lg:text-5xl">
              Studi Kasus & Produk Terpilih
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-relaxed text-slate-600 lg:justify-self-end">
            Preview platform digital yang telah kami bangun dan rilis bersama
            mitra bisnis. Layar, arsitektur, dan konteks dampak terlihat sejak
            kartu pertama.
          </p>
        </FadeUp>

        <StaggerContainer className="grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <StaggerItem key={item.slug}>
              <Link
                href={PUBLIC_ROUTES.portfolioDetail(item.slug)}
                className="group block h-full"
              >
                <Card className="h-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-0 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl">
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 xl:aspect-[16/11]">
                    {item.featuredImage ? (
                      <Image
                        src={item.featuredImage}
                        alt={item.title}
                        fill
                        sizes="(min-width: 1024px) 31vw, (min-width: 768px) 33vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
                        No image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F263A]/90 via-[#0F263A]/25 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <Badge className="rounded-full bg-[#00B1E1] px-3 py-1 font-bold text-[#0F263A] shadow-sm hover:bg-[#0094BD]">
                        {item.industry}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4 flex size-9 translate-y-1 items-center justify-center rounded-full border border-white/20 bg-[#0F263A]/80 text-[#00B1E1] opacity-0 backdrop-blur transition-all group-hover:translate-y-0 group-hover:opacity-100">
                      <ArrowUpRight className="size-4" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                      <div className="mb-1 text-xs font-semibold tracking-wider text-slate-300 uppercase">
                        {item.client}
                      </div>
                      <h3 className="font-serif text-xl leading-tight font-bold text-white sm:text-2xl">
                        {item.title}
                      </h3>
                      <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#00B1E1]">
                        Buka detail studi kasus
                        <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 border-t border-slate-100 bg-white text-xs text-slate-600">
                    {["Cakupan", "Proses", "Rilis"].map((label) => (
                      <div
                        key={label}
                        className="border-r border-slate-100 px-4 py-3 last:border-r-0"
                      >
                        <div className="font-bold text-[#0F263A]">{label}</div>
                        <div className="mt-0.5 text-slate-500">Alur sprint</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeUp className="mt-10 flex justify-center">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full border-2 border-[#0F263A] bg-transparent px-8 font-bold text-[#0F263A] transition-all hover:bg-[#0F263A] hover:text-white"
          >
            <Link href={PUBLIC_ROUTES.portfolio}>
              Lihat Semua Portfolio
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </FadeUp>
      </div>
    </section>
  );
}
