import { prisma } from "@/lib/prisma";
import {
  getFallbackBlogPost,
  publicBlogPosts,
  type PublicBlogPost,
} from "@/lib/public-fallbacks";
import { safeDb } from "@/lib/safe-db";

export type BlogDetailPost = PublicBlogPost;

export async function getBlogDetailPost(slug: string) {
  return safeDb<BlogDetailPost | null>(
    async () => {
      const post = await prisma.blogPost.findFirst({
        where: { slug, published: true },
        include: {
          author: { select: { name: true, avatar: true } },
          category: { select: { name: true, slug: true } },
        },
      });
      return post ?? getFallbackBlogPost(slug);
    },
    getFallbackBlogPost(slug)
  );
}

export async function getBlogStaticParams() {
  const posts = await safeDb(
    async () =>
      prisma.blogPost.findMany({
        where: { published: true },
        select: { slug: true },
      }),
    publicBlogPosts.map((post) => ({ slug: post.slug }))
  );
  const slugs = new Set([
    ...publicBlogPosts.map((post) => post.slug),
    ...posts.map((post) => post.slug),
  ]);
  return [...slugs].map((slug) => ({ slug }));
}
