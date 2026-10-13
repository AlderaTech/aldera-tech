"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { blogPostSchema } from "@/lib/validations/blog";
import { isStaff } from "@/lib/permissions";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";

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
      content: data.content,
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
      content: data.content,
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
  revalidatePath(ADMIN_ROUTES.blog);
}

/**
 * Increment view counter. Called client-side from blog detail.
 * Fire-and-forget, errors are swallowed since this is non-critical.
 */
export async function incrementBlogViewAction(slug: string) {
  try {
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
