import { prisma } from "@/lib/prisma";
import { resolveBlogPostImage } from "@/lib/public-fallbacks";
import { parsePage, parsePageSize } from "@/lib/pagination";
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

export async function getBlogList(params?: {
  page?: number;
  limit?: number;
  category?: string;
  q?: string;
}) {
  const page = parsePage(params?.page);
  const pageSize = parsePageSize(params?.limit, BLOG_PAGE_SIZE);

  return safeDb<BlogListItem[]>(async () => {
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
    return data.map((post) => ({
      ...post,
      featuredImage: resolveBlogPostImage(post.slug, post.featuredImage),
    }));
  }, []);
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
