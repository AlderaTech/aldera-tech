import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/services",
    "/portfolio",
    "/pricing",
    "/testimonials",
    "/faq",
    "/blog",
    "/contact",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
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
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...cases.map((c) => ({
      url: `${base}/portfolio/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
