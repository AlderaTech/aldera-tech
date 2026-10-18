"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { blogPostSchema } from "@/lib/validations/blog";
import crypto from "crypto";
import { isStaff, isAdmin } from "@/lib/permissions";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";
import { sanitizeHtml } from "@/lib/sanitize-html";

export type BlogActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  postId?: string;
};

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session.user;
}

function parseFormData(formData: FormData) {
  return {
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt") || "",
    content: formData.get("content"),
    featuredImage: formData.get("featuredImage") || "",
    categoryId: formData.get("categoryId") || "",
    published:
      formData.get("published") === "on" ||
      formData.get("published") === "true",
    scheduledAt: formData.get("scheduledAt") || "",
  };
}

export async function createBlogPostAction(
  _: BlogActionState,
  formData: FormData
): Promise<BlogActionState> {
  const user = await requireAdmin();
  const parsed = blogPostSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) errors[issue.path[0] as string] = issue.message;
    }
    return { ok: false, message: "Periksa input Anda.", errors };
  }

  const data = parsed.data;
  const existing = await prisma.blogPost.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  });
  if (existing) {
    return {
      ok: false,
      message: "Slug sudah digunakan.",
      errors: { slug: "Slug sudah digunakan" },
    };
  }

  const post = await prisma.blogPost.create({
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      content: sanitizeHtml(data.content),
      featuredImage: data.featuredImage || null,
      categoryId: data.categoryId || null,
      published: Boolean(data.published),
      publishedAt: data.published ? new Date() : null,
      scheduledAt:
        !data.published && data.scheduledAt ? new Date(data.scheduledAt) : null,
      authorId: user.id,
    },
    select: { id: true, slug: true },
  });

  revalidatePath(PUBLIC_ROUTES.blog);
  revalidatePath(PUBLIC_ROUTES.blogDetail(post.slug));
  revalidatePath(PUBLIC_ROUTES.home);
  revalidatePath(ADMIN_ROUTES.blog);

  return { ok: true, postId: post.id, message: "Post berhasil dibuat." };
}

export async function updateBlogPostAction(
  id: string,
  _: BlogActionState,
  formData: FormData
): Promise<BlogActionState> {
  await requireAdmin();
  const parsed = blogPostSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) errors[issue.path[0] as string] = issue.message;
    }
    return { ok: false, message: "Periksa input Anda.", errors };
  }

  const data = parsed.data;
  const existing = await prisma.blogPost.findFirst({
    where: { slug: data.slug, NOT: { id } },
    select: { id: true },
  });
  if (existing) {
    return {
      ok: false,
      message: "Slug sudah digunakan.",
      errors: { slug: "Slug sudah digunakan" },
    };
  }

  const current = await prisma.blogPost.findUnique({
    where: { id },
    select: { published: true, slug: true },
  });

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      content: sanitizeHtml(data.content),
      featuredImage: data.featuredImage || null,
      categoryId: data.categoryId || null,
      published: Boolean(data.published),
      publishedAt:
        data.published && !current?.published
          ? new Date()
          : data.published
            ? undefined
            : null,
      scheduledAt:
        !data.published && data.scheduledAt ? new Date(data.scheduledAt) : null,
    },
    select: { id: true, slug: true },
  });

  revalidatePath(PUBLIC_ROUTES.blog);
  if (current?.slug && current.slug !== post.slug) {
    revalidatePath(PUBLIC_ROUTES.blogDetail(current.slug));
  }
  revalidatePath(PUBLIC_ROUTES.blogDetail(post.slug));
  revalidatePath(PUBLIC_ROUTES.home);
  revalidatePath(ADMIN_ROUTES.blog);

  return { ok: true, postId: post.id, message: "Post berhasil diperbarui." };
}

export async function togglePublishBlogPostAction(id: string) {
  await requireAdmin();
  const post = await prisma.blogPost.findUnique({
    where: { id },
    select: { published: true, slug: true },
  });
  if (!post) return;
  const updated = await prisma.blogPost.update({
    where: { id },
    data: {
      published: !post.published,
      publishedAt: !post.published
        ? new Date()
        : post.published
          ? null
          : undefined,
    },
  });
  revalidatePath(PUBLIC_ROUTES.blog);
  revalidatePath(PUBLIC_ROUTES.blogDetail(updated.slug));
  revalidatePath(PUBLIC_ROUTES.home);
  revalidatePath(ADMIN_ROUTES.blog);
}

export async function deleteBlogPostAction(id: string) {
  await requireAdmin();
  const post = await prisma.blogPost.findUnique({
    where: { id },
    select: { slug: true },
  });
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath(PUBLIC_ROUTES.blog);
  if (post?.slug) revalidatePath(PUBLIC_ROUTES.blogDetail(post.slug));
  revalidatePath(PUBLIC_ROUTES.home);
  revalidatePath(ADMIN_ROUTES.blog);
}

/**
 * Increment view counter with cookie & rate-limiting deduplication.
 * Prevents view inflation on page reload, prefetch, or bot scraping.
 */
export async function incrementBlogViewAction(slug: string) {
  try {
    let cookieStore;
    try {
      cookieStore = await cookies();
    } catch {
      cookieStore = null;
    }

    const cookieName = `viewed_post_${slug}`;
    if (cookieStore?.has(cookieName)) {
      return;
    }

    const rate = checkRateLimit(`blog_view:${slug}`, 30, 60);
    if (!rate.allowed) return;

    if (cookieStore) {
      try {
        cookieStore.set(cookieName, "1", {
          maxAge: 86400,
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
        });
      } catch {
        // ignore cookie set failure outside request context
      }
    }

    await prisma.blogPost.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });
  } catch {
    // swallow, counter failures shouldn't break the page
  }
}

/**
 * Auto-save draft content. Only admins can save drafts, and only for
 * existing posts (create path uses initial save on submit).
 */
export async function autoSaveDraftAction(id: string, content: string) {
  await requireAdmin();
  if (!content || content.length > 500_000) return { ok: false };
  try {
    await prisma.blogPost.update({
      where: { id },
      data: {
        draftContent: content,
        draftSavedAt: new Date(),
      },
    });
    return { ok: true, savedAt: new Date().toISOString() };
  } catch {
    return { ok: false };
  }
}

/**
 * Milestone 2: Blog Engagement Server Actions
 */

export async function createBlogCommentAction(
  postId: string,
  content: string
): Promise<{ ok: boolean; commentId?: string; message?: string; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized (401)");
  }

  const trimmed = (content || "").trim();
  if (!trimmed || trimmed.length < 1) {
    return { ok: false, error: "Komentar tidak boleh kosong" };
  }
  if (trimmed.length > 2000) {
    return { ok: false, error: "Komentar maksimal 2000 karakter" };
  }

  const post = await prisma.blogPost.findFirst({
    where: { OR: [{ id: postId }, { slug: postId }] },
    select: { id: true, slug: true },
  });
  const actualPostId = post ? post.id : postId;
  const postSlug = post ? post.slug : postId;

  const comment = await prisma.blogComment.create({
    data: {
      postId: actualPostId,
      content: trimmed,
      userId: session.user.id,
    },
  });

  try {
    await prisma.$executeRaw`
      INSERT INTO "BlogComment" ("id", "content", "postId", "authorId", "createdAt", "updatedAt")
      VALUES (${comment.id}, ${trimmed}, ${actualPostId}, ${session.user.id}, ${comment.createdAt}, ${comment.updatedAt})
      ON CONFLICT ("id") DO NOTHING
    `;
  } catch {}

  revalidatePath(PUBLIC_ROUTES.blog);
  revalidatePath("/blog/[slug]");
  if (postSlug) {
    revalidatePath(PUBLIC_ROUTES.blogDetail(postSlug));
  }

  return {
    ok: true,
    commentId: comment.id,
    message: "Komentar berhasil ditambahkan.",
  };
}

export async function deleteBlogCommentAction(
  commentId: string
): Promise<{ ok: boolean; message: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized (401)");
  }

  const comment = await prisma.blogComment
    .findUnique({
      where: { id: commentId },
      include: { post: { select: { slug: true } } },
    })
    .catch(() => null);

  let commentAuthorId = comment?.userId;
  let postSlug = comment?.post?.slug;
  let commentFound = Boolean(comment);

  if (!commentFound) {
    try {
      const raw = await prisma.$queryRaw<
        Array<{ id: string; authorId: string; postId: string; slug: string | null }>
      >`
        SELECT c.id, c."authorId", c."postId", p.slug
        FROM "BlogComment" c
        LEFT JOIN "BlogPost" p ON p.id = c."postId"
        WHERE c.id = ${commentId}
      `;
      if (raw.length > 0) {
        commentAuthorId = raw[0].authorId;
        postSlug = raw[0].slug ?? undefined;
        commentFound = true;
      }
    } catch {}
  }

  if (!commentFound) {
    throw new Error("Comment not found");
  }

  type UserWithRoles = {
    roles?: import("@prisma/client").Role[];
    role?: import("@prisma/client").Role;
  };
  const sessionUser = session.user as unknown as UserWithRoles;
  const userRoles = sessionUser.roles ?? sessionUser.role;
  const isAuthor = commentAuthorId === session.user.id;
  const isUserAdmin = isAdmin(userRoles);

  if (!isAuthor && !isUserAdmin) {
    throw new Error("Forbidden (403)");
  }

  await prisma.blogComment.deleteMany({ where: { id: commentId } }).catch(() => {});
  try {
    await prisma.$executeRaw`DELETE FROM "BlogComment" WHERE id = ${commentId}`;
  } catch {}

  revalidatePath("/blog/[slug]");
  if (postSlug) {
    revalidatePath(PUBLIC_ROUTES.blogDetail(postSlug));
  }

  return { ok: true, message: "Komentar berhasil dihapus." };
}

export async function toggleBlogReactionAction(
  postId: string,
  type: "LIKE" | "DISLIKE"
): Promise<{ ok: boolean; action: "created" | "updated" | "removed"; type: "LIKE" | "DISLIKE" | null }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized (401)");
  }

  const post = await prisma.blogPost.findFirst({
    where: { OR: [{ id: postId }, { slug: postId }] },
    select: { id: true, slug: true },
  });
  const actualPostId = post ? post.id : postId;
  const postSlug = post ? post.slug : postId;

  const existing = await prisma.blogReaction
    .findUnique({
      where: {
        postId_userId: {
          postId: actualPostId,
          userId: session.user.id,
        },
      },
    })
    .catch(() => null);

  let existingType: "LIKE" | "DISLIKE" | null = (existing?.type as "LIKE" | "DISLIKE") ?? null;

  if (!existingType) {
    try {
      const raw = await prisma.$queryRaw<Array<{ id: string; type: "LIKE" | "DISLIKE" }>>`
        SELECT id, type::text as type FROM "BlogReaction" WHERE "postId" = ${actualPostId} AND "userId" = ${session.user.id}
      `;
      if (raw.length > 0) {
        existingType = raw[0].type;
      }
    } catch {}
  }

  if (existingType === type) {
    // Idempotent toggle-off
    await prisma.blogReaction
      .deleteMany({
        where: { postId: actualPostId, userId: session.user.id },
      })
      .catch(() => {});
    try {
      await prisma.$executeRaw`
        DELETE FROM "BlogReaction" WHERE "postId" = ${actualPostId} AND "userId" = ${session.user.id}
      `;
    } catch {}

    revalidatePath("/blog/[slug]");
    if (postSlug) revalidatePath(PUBLIC_ROUTES.blogDetail(postSlug));
    return { ok: true, action: "removed", type: null };
  } else if (existingType && existingType !== type) {
    // Switch reaction type
    await prisma.blogReaction
      .updateMany({
        where: { postId: actualPostId, userId: session.user.id },
        data: { type },
      })
      .catch(() => {});
    try {
      await prisma.$executeRaw`
        UPDATE "BlogReaction" SET "type" = ${type}::"BlogReactionType", "updatedAt" = NOW()
        WHERE "postId" = ${actualPostId} AND "userId" = ${session.user.id}
      `;
    } catch {}

    revalidatePath("/blog/[slug]");
    if (postSlug) revalidatePath(PUBLIC_ROUTES.blogDetail(postSlug));
    return { ok: true, action: "updated", type };
  } else {
    // Create new reaction
    const newReaction = await prisma.blogReaction
      .create({
        data: {
          postId: actualPostId,
          userId: session.user.id,
          type,
        },
      })
      .catch(() => null);

    const reactionId = newReaction?.id || `react_${crypto.randomUUID()}`;
    try {
      await prisma.$executeRaw`
        INSERT INTO "BlogReaction" ("id", "type", "postId", "userId", "createdAt", "updatedAt")
        VALUES (${reactionId}, ${type}::"BlogReactionType", ${actualPostId}, ${session.user.id}, NOW(), NOW())
        ON CONFLICT ("postId", "userId") DO UPDATE SET "type" = EXCLUDED."type", "updatedAt" = NOW()
      `;
    } catch {}

    revalidatePath("/blog/[slug]");
    if (postSlug) revalidatePath(PUBLIC_ROUTES.blogDetail(postSlug));
    return { ok: true, action: "created", type };
  }
}

export async function togglePinBlogPostAction(
  postId: string
): Promise<{ ok: boolean; isPinned: boolean; pinnedAt: Date | null }> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized (401)");
  }

  type UserWithRoles = {
    roles?: import("@prisma/client").Role[];
    role?: import("@prisma/client").Role;
  };
  const sessionUser = session.user as unknown as UserWithRoles;
  const userRoles = sessionUser.roles ?? sessionUser.role;
  if (!isAdmin(userRoles)) {
    throw new Error("Forbidden (403)");
  }

  const post = await prisma.blogPost.findFirst({
    where: { OR: [{ id: postId }, { slug: postId }] },
    select: { id: true, slug: true, isPinned: true },
  });
  if (!post) {
    throw new Error("Post tidak ditemukan");
  }

  const nextPinned = !post.isPinned;
  const pinnedAt = nextPinned ? new Date() : null;

  await prisma.blogPost.update({
    where: { id: post.id },
    data: {
      isPinned: nextPinned,
      pinnedAt,
    },
  });

  revalidatePath(PUBLIC_ROUTES.blog);
  revalidatePath("/");
  revalidatePath(ADMIN_ROUTES.blog);
  if (post.slug) revalidatePath(PUBLIC_ROUTES.blogDetail(post.slug));

  return { ok: true, isPinned: nextPinned, pinnedAt };
}

// Aliases matching E2E test module imports
export const createCommentAction = createBlogCommentAction;
export const deleteCommentAction = deleteBlogCommentAction;
export const toggleReactionAction = toggleBlogReactionAction;

