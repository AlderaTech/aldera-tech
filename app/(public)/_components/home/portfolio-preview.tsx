import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, PanelsTopLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/motion";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import {
  publicCaseStudies,
  resolveCaseStudyImage,
} from "@/lib/public-fallbacks";
import { PUBLIC_ROUTES } from "@/lib/routes";
import { safeDb } from "@/lib/safe-db";
import styles from "../studio.module.css";
import portfolioStyles from "./portfolio-preview.module.css";

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
    <section className={portfolioStyles.section}>
      <div className={styles.container}>
        <FadeUp className={portfolioStyles.header}>
          <div className={portfolioStyles.headingBlock}>
            <p className={portfolioStyles.eyebrow}>
              <span aria-hidden="true">02</span>
              Portfolio / Pilihan Karya
            </p>
            <h2 className={portfolioStyles.heading}>
              Studi Kasus & <span>Produk Terpilih</span>
            </h2>
          </div>
          <p className={portfolioStyles.description}>
            Preview platform digital yang telah kami bangun dan rilis bersama
            mitra bisnis. Layar, arsitektur, dan konteks dampak terlihat sejak
            kartu pertama.
          </p>
        </FadeUp>

        <StaggerContainer className={portfolioStyles.caseGrid}>
          {items.map((item, index) => (
            <StaggerItem
              key={item.slug}
              className={cn(
                portfolioStyles.caseItem,
                index === 0 && portfolioStyles.featuredItem
              )}
            >
              <Link
                href={PUBLIC_ROUTES.portfolioDetail(item.slug)}
                className={portfolioStyles.caseLink}
                aria-label={`Lihat studi kasus ${item.title}`}
              >
                <article
                  className={cn(
                    portfolioStyles.caseCard,
                    index === 0 && portfolioStyles.featuredCard
                  )}
                >
                  <div className={portfolioStyles.media}>
                    {item.featuredImage ? (
                      <Image
                        src={item.featuredImage}
                        alt={item.title}
                        fill
                        sizes={
                          index === 0
                            ? "(min-width: 1280px) 700px, (min-width: 768px) 54vw, 90vw"
                            : "(min-width: 1280px) 620px, (min-width: 768px) 46vw, 90vw"
                        }
                        quality={90}
                        className={portfolioStyles.image}
                      />
                    ) : (
                      <div className={portfolioStyles.imageFallback}>
                        <PanelsTopLeft aria-hidden="true" />
                        <span>Gambar proyek belum tersedia</span>
                      </div>
                    )}
                    <div className={portfolioStyles.industryBadge}>
                      <Badge className="rounded-full border border-white/70 bg-white/90 px-3 py-1 font-semibold text-brand-navy shadow-sm backdrop-blur-md hover:bg-white">
                        {item.industry}
                      </Badge>
                    </div>
                    <div
                      className={portfolioStyles.openButton}
                      aria-hidden="true"
                    >
                      <ArrowUpRight className="size-4" />
                    </div>
                  </div>
                  <div className={portfolioStyles.caseCopy}>
                    <div className={portfolioStyles.client}>{item.client}</div>
                    <h3 className={portfolioStyles.caseTitle}>{item.title}</h3>
                    <div className={portfolioStyles.detailLink}>
                      Buka detail studi kasus
                      <ArrowUpRight aria-hidden="true" />
                    </div>
                  </div>
                  <div className={portfolioStyles.metaGrid}>
                    {["Cakupan", "Proses", "Rilis"].map((label) => (
                      <div key={label} className={portfolioStyles.metaCell}>
                        <div className={portfolioStyles.metaLabel}>{label}</div>
                        <div className={portfolioStyles.metaCaption}>
                          Alur sprint
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <FadeUp className={portfolioStyles.allProjectsWrap}>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full border-brand-navy/25 bg-white/85 px-8 font-semibold text-brand-navy shadow-sm backdrop-blur transition-[background,color,border,transform] hover:-translate-y-0.5 hover:border-brand-navy hover:bg-brand-navy hover:text-white motion-reduce:transition-none"
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
