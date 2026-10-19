import { prisma } from "@/lib/prisma";
import {
  getFallbackBlogPost,
  publicBlogPosts,
  type PublicBlogPost,
} from "@/lib/public-fallbacks";
import { safeDb } from "@/lib/safe-db";

export type BlogDetailPost = PublicBlogPost;

export async function getBlogDetailPost(slug: string) {
  return safeDb<BlogDetailPost | null>(async () => {
    const post = await prisma.blogPost.findFirst({
      where: { slug, published: true },
      include: {
        author: { select: { name: true, avatar: true } },
        category: { select: { name: true, slug: true } },
      },
    });
    return post ?? getFallbackBlogPost(slug);
  }, getFallbackBlogPost(slug));
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

export type BlogCommentItem = {
  id: string;
  content: string;
  createdAt: Date;
  authorId: string;
  authorName: string;
};

export type BlogEngagementData = {
  likesCount: number;
  dislikesCount: number;
  userReaction: "LIKE" | "DISLIKE" | null;
  comments: BlogCommentItem[];
};

export async function getBlogEngagement(
  postId: string,
  userId?: string
): Promise<BlogEngagementData> {
  let likesCount = 0;
  let dislikesCount = 0;
  let userReaction: "LIKE" | "DISLIKE" | null = null;
  let comments: BlogCommentItem[] = [];

  try {
    const counts = await prisma.$queryRaw<
      Array<{ likes: number; dislikes: number }>
    >`
      SELECT
        COUNT(DISTINCT CASE WHEN type = 'LIKE' THEN id END)::int as likes,
        COUNT(DISTINCT CASE WHEN type = 'DISLIKE' THEN id END)::int as dislikes
      FROM (
        SELECT id, type::text as type, "postId" FROM "BlogReaction"
        UNION
        SELECT id, type::text as type, "postId" FROM "blog_reactions"
      ) r
      WHERE r."postId" = ${postId}
    `;
    if (counts.length > 0) {
      likesCount = counts[0].likes || 0;
      dislikesCount = counts[0].dislikes || 0;
    }
  } catch {
    likesCount = await prisma.blogReaction
      .count({ where: { postId, type: "LIKE" } })
      .catch(() => 0);
    dislikesCount = await prisma.blogReaction
      .count({ where: { postId, type: "DISLIKE" } })
      .catch(() => 0);
  }

  if (userId) {
    try {
      const userReact = await prisma.$queryRaw<
        Array<{ type: "LIKE" | "DISLIKE" }>
      >`
        SELECT type::text as type
        FROM (
          SELECT id, type, "postId", "userId" FROM "BlogReaction"
          UNION
          SELECT id, type, "postId", "userId" FROM "blog_reactions"
        ) r
        WHERE r."postId" = ${postId} AND r."userId" = ${userId}
        LIMIT 1
      `;
      if (userReact.length > 0) {
        userReaction = userReact[0].type;
      }
    } catch {
      const r = await prisma.blogReaction
        .findUnique({
          where: { postId_userId: { postId, userId } },
          select: { type: true },
        })
        .catch(() => null);
      userReaction = r ? r.type : null;
    }
  }

  try {
    comments = await prisma.$queryRaw<BlogCommentItem[]>`
      SELECT DISTINCT ON (c.id)
        c.id,
        c.content,
        c."createdAt",
        COALESCE(c."authorId", c."userId") as "authorId",
        u.name as "authorName"
      FROM (
        SELECT id, content, "createdAt", "authorId", NULL as "userId", "postId" FROM "BlogComment"
        UNION ALL
        SELECT id, content, "createdAt", NULL as "authorId", "userId", "postId" FROM "blog_comments"
      ) c
      JOIN "User" u ON u.id = COALESCE(c."authorId", c."userId")
      WHERE c."postId" = ${postId}
      ORDER BY c.id, c."createdAt" ASC
    `;
    comments.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  } catch {
    const dbComments = await prisma.blogComment
      .findMany({
        where: { postId },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "asc" },
      })
      .catch(() => []);
    comments = dbComments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      authorId: c.userId,
      authorName: c.user?.name || "Pengguna",
    }));
  }

  return {
    likesCount,
    dislikesCount,
    userReaction,
    comments,
  };
}
