"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { blogPostSchema } from "@/lib/validations/blog";
import { lockAccountKey } from "@/lib/account-locks";
import {
  hasPermission,
  isAdmin,
  PERMISSIONS,
  type Permission,
} from "@/lib/permissions";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";
import { sanitizeHtml } from "@/lib/sanitize-html";

export type BlogActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  postId?: string;
};

async function requireAdmin(permission: Permission = PERMISSIONS.BLOG_EDIT) {
  const session = await auth();
  if (
    !session?.user ||
    !hasPermission(session.user.roles ?? session.user.role, permission)
  ) {
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
  const user = await requireAdmin(PERMISSIONS.BLOG_CREATE);
  const parsed = blogPostSchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) errors[issue.path[0] as string] = issue.message;
    }
    return { ok: false, message: "Periksa input Anda.", errors };
  }

  const data = parsed.data;
  if (data.published || data.scheduledAt)
    await requireAdmin(PERMISSIONS.BLOG_PUBLISH);
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
    select: { published: true, slug: true, scheduledAt: true },
  });

  if (!current) return { ok: false, message: "Artikel tidak ditemukan." };
  const scheduled =
    !data.published && data.scheduledAt ? new Date(data.scheduledAt) : null;
  if (
    Boolean(data.published) !== current.published ||
    scheduled?.getTime() !== current.scheduledAt?.getTime()
  )
    await requireAdmin(PERMISSIONS.BLOG_PUBLISH);

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
  await requireAdmin(PERMISSIONS.BLOG_PUBLISH);
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
  await requireAdmin(PERMISSIONS.BLOG_DELETE);
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
): Promise<{
  ok: boolean;
  commentId?: string;
  message?: string;
  error?: string;
}> {
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
    where: { OR: [{ id: postId }, { slug: postId }], published: true },
    select: { id: true, slug: true },
  });
  if (!post) return { ok: false, error: "Artikel tidak ditemukan." };
  const actualPostId = post.id;
  const postSlug = post ? post.slug : postId;

  const comment = await prisma.blogComment.create({
    data: {
      postId: actualPostId,
      content: trimmed,
      userId: session.user.id,
    },
  });

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
  if (!session?.user?.id) throw new Error("Unauthorized (401)");
  const comment = await prisma.blogComment.findUnique({
    where: { id: commentId },
    include: { post: { select: { slug: true } } },
  });
  if (!comment) throw new Error("Comment not found");
  if (
    comment.userId !== session.user.id &&
    !isAdmin(session.user.roles ?? session.user.role)
  )
    throw new Error("Forbidden (403)");
  await prisma.blogComment.delete({ where: { id: commentId } });
  revalidatePath(PUBLIC_ROUTES.blogDetail(comment.post.slug));
  return { ok: true, message: "Komentar berhasil dihapus." };
}

export async function toggleBlogReactionAction(
  postId: string,
  type: "LIKE" | "DISLIKE"
): Promise<{
  ok: boolean;
  action: "created" | "updated" | "removed";
  type: "LIKE" | "DISLIKE" | null;
}> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized (401)");
  if (type !== "LIKE" && type !== "DISLIKE")
    throw new Error("Reaksi tidak valid.");
  const post = await prisma.blogPost.findFirst({
    where: { OR: [{ id: postId }, { slug: postId }], published: true },
    select: { id: true, slug: true },
  });
  if (!post) throw new Error("Artikel tidak ditemukan.");
  const result = await prisma.$transaction(async (tx) => {
    await lockAccountKey(tx, "reaction:" + post.id + ":" + session.user.id);
    const key = { postId: post.id, userId: session.user.id };
    const existing = await tx.blogReaction.findUnique({
      where: { postId_userId: key },
    });
    if (existing?.type === type) {
      await tx.blogReaction.delete({ where: { id: existing.id } });
      return { action: "removed" as const, type: null };
    }
    await tx.blogReaction.upsert({
      where: { postId_userId: key },
      create: { ...key, type },
      update: { type },
    });
    return {
      action: existing ? ("updated" as const) : ("created" as const),
      type,
    };
  });
  revalidatePath(PUBLIC_ROUTES.blogDetail(post.slug));
  return { ok: true, ...result };
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
