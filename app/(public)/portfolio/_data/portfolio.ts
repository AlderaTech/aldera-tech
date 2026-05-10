import { prisma } from "@/lib/prisma";
import {
  getFallbackCaseStudy,
  publicCaseStudies,
  resolveCaseStudyImage,
  type PublicCaseStudy,
} from "@/lib/public-fallbacks";
import { safeDb } from "@/lib/safe-db";

export type PortfolioItem = Pick<
  PublicCaseStudy,
  "slug" | "title" | "client" | "industry" | "summary" | "techStack"
> & {
  featuredImage: string | null;
};

export type PortfolioDetail = PublicCaseStudy;

const fallbackPortfolioItems: PortfolioItem[] = publicCaseStudies.map((item) => ({
  slug: item.slug,
  title: item.title,
  client: item.client,
  industry: item.industry,
  summary: item.summary,
  featuredImage: item.featuredImage,
  techStack: item.techStack,
}));

export async function getPortfolioItems() {
  return safeDb<PortfolioItem[]>(async () => {
    const data = await prisma.caseStudy.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
      select: {
        slug: true,
        title: true,
        client: true,
        industry: true,
        summary: true,
        featuredImage: true,
        techStack: true,
      },
    });

    return data.length
      ? data.map((item) => ({
          ...item,
          featuredImage: resolveCaseStudyImage(item.slug, item.featuredImage),
        }))
      : fallbackPortfolioItems;
  }, fallbackPortfolioItems);
}

export async function getPortfolioItem(slug: string) {
  return safeDb<PortfolioDetail | null>(async () => {
    const item = await prisma.caseStudy.findFirst({
      where: { slug, published: true },
    });
    return item ?? getFallbackCaseStudy(slug);
  }, getFallbackCaseStudy(slug));
}

export async function getPortfolioStaticParams() {
  const items = await safeDb(
    async () =>
      prisma.caseStudy.findMany({
        where: { published: true },
        select: { slug: true },
      }),
    publicCaseStudies.map((item) => ({ slug: item.slug }))
  );
  const slugs = new Set([
    ...publicCaseStudies.map((item) => item.slug),
    ...items.map((item) => item.slug),
  ]);
  return [...slugs].map((slug) => ({ slug }));
}
