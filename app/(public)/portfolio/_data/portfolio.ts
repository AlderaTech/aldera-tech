import { prisma } from "@/lib/prisma";
import {
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

    return data.map((item) => ({
      ...item,
      featuredImage: resolveCaseStudyImage(item.slug, item.featuredImage),
    }));
  }, []);
}

export async function getPortfolioItem(slug: string) {
  return safeDb<PortfolioDetail | null>(async () => {
    const item = await prisma.caseStudy.findFirst({
      where: { slug, published: true },
    });
    return item;
  }, null);
}

export async function getPortfolioStaticParams() {
  const items = await safeDb(
    async () =>
      prisma.caseStudy.findMany({
        where: { published: true },
        select: { slug: true },
      }),
    []
  );
  const slugs = new Set([...items.map((item) => item.slug)]);
  return [...slugs].map((slug) => ({ slug }));
}
