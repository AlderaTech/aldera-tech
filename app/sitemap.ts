import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { PUBLIC_ROUTES } from "@/lib/routes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const staticRoutes: MetadataRoute.Sitemap = [
    PUBLIC_ROUTES.home,
    PUBLIC_ROUTES.about,
    PUBLIC_ROUTES.services,
    PUBLIC_ROUTES.portfolio,
    PUBLIC_ROUTES.pricing,
    PUBLIC_ROUTES.testimonials,
    PUBLIC_ROUTES.faq,
    PUBLIC_ROUTES.blog,
    PUBLIC_ROUTES.contact,
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === PUBLIC_ROUTES.home ? 1 : 0.7,
  }));

  const [posts, cases] = await Promise.all([
    safeDb(
      async () =>
        await prisma.blogPost.findMany({
          where: { published: true },
          select: { slug: true, updatedAt: true },
        }),
      [] as { slug: string; updatedAt: Date }[]
    ),
    safeDb(
      async () =>
        await prisma.caseStudy.findMany({
          where: { published: true },
          select: { slug: true, updatedAt: true },
        }),
      [] as { slug: string; updatedAt: Date }[]
    ),
  ]);

  const dynamicRoutes: MetadataRoute.Sitemap = [
    ...posts.map((p) => ({
      url: `${base}${PUBLIC_ROUTES.blogPost(p.slug)}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...cases.map((c) => ({
      url: `${base}${PUBLIC_ROUTES.portfolioDetail(c.slug)}`,
      lastModified: c.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
