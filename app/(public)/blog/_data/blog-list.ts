import { prisma } from "@/lib/prisma";
import { publicBlogPosts, resolveBlogPostImage } from "@/lib/public-fallbacks";
import { safeDb } from "@/lib/safe-db";

export type BlogListItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  publishedAt: Date | null;
  isPinned: boolean;
  pinnedAt: Date | null;
  author: { name: string } | null;
  category: { name: string; slug: string } | null;
};

export type BlogCategoryFilter = {
  slug: string;
  name: string;
};

export const BLOG_PAGE_SIZE = 9;

const fallback: BlogListItem[] = publicBlogPosts.map((post) => ({
  id: post.id,
  slug: post.slug,
  title: post.title,
  excerpt: post.excerpt,
  content: post.content,
  featuredImage: post.featuredImage,
  publishedAt: post.publishedAt,
  isPinned: post.isPinned ?? false,
  pinnedAt: post.pinnedAt ?? null,
  author: post.author ? { name: post.author.name } : null,
  category: post.category,
}));

export async function getBlogList(params?: {
  page?: number;
  limit?: number;
  category?: string;
  q?: string;
}) {
  const page = params?.page ?? 1;
  const pageSize = params?.limit ?? BLOG_PAGE_SIZE;

  return safeDb<BlogListItem[]>(
    async () => {
      const data = await prisma.blogPost.findMany({
        where: {
          published: true,
          ...(params?.category ? { category: { slug: params.category } } : {}),
          ...(params?.q
            ? {
                OR: [
                  { title: { contains: params.q, mode: "insensitive" } },
                  { excerpt: { contains: params.q, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          content: true,
          featuredImage: true,
          publishedAt: true,
          isPinned: true,
          pinnedAt: true,
          author: { select: { name: true } },
          category: { select: { name: true, slug: true } },
        },
      });
      if (params?.q || params?.category) {
        return data.length
          ? data.map((post) => ({
              ...post,
              featuredImage: resolveBlogPostImage(
                post.slug,
                post.featuredImage
              ),
            }))
          : [];
      }
      return data.length
        ? data.map((post) => ({
            ...post,
            featuredImage: resolveBlogPostImage(post.slug, post.featuredImage),
          }))
        : fallback;
    },
    params?.q || params?.category ? [] : fallback
  );
}

export async function getBlogCategories() {
  return safeDb(
    async () =>
      prisma.blogCategory.findMany({
        orderBy: { name: "asc" },
        select: { slug: true, name: true },
      }),
    [] as BlogCategoryFilter[]
  );
}
