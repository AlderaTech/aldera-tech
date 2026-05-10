"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission, PERMISSIONS, type Permission } from "@/lib/permissions";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";
import { blogCategorySchema } from "@/lib/validations/blog-category";

export type BlogCategoryActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  categoryId?: string;
};

async function requireBlogPermission(permission: Permission) {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.role, permission)) {
    throw new Error("Forbidden");
  }
  return session.user;
}

function parseFormData(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || "",
  };
}

function validationErrors(
  issues: { path: PropertyKey[]; message: string }[]
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    if (issue.path[0]) errors[String(issue.path[0])] = issue.message;
  }
  return errors;
}

function revalidateBlogCategorySurfaces({
  slug,
  postSlugs = [],
}: {
  slug?: string;
  postSlugs?: string[];
}) {
  revalidatePath(PUBLIC_ROUTES.blog);
  if (slug) revalidatePath(PUBLIC_ROUTES.blogCategory(slug));
  for (const postSlug of postSlugs) {
    revalidatePath(PUBLIC_ROUTES.blogDetail(postSlug));
  }
  revalidatePath(ADMIN_ROUTES.blog);
  revalidatePath(ADMIN_ROUTES.blogCategories);
}

export async function createBlogCategoryAction(
  _: BlogCategoryActionState,
  formData: FormData
): Promise<BlogCategoryActionState> {
  await requireBlogPermission(PERMISSIONS.BLOG_CREATE);

  const parsed = blogCategorySchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa input kategori.",
      errors: validationErrors(parsed.error.issues),
    };
  }

  const data = parsed.data;
  const existing = await prisma.blogCategory.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  });
  if (existing) {
    return {
      ok: false,
      message: "Slug kategori sudah digunakan.",
      errors: { slug: "Slug sudah digunakan" },
    };
  }

  const category = await prisma.blogCategory.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
    },
    select: { id: true, slug: true },
  });

  revalidateBlogCategorySurfaces({ slug: category.slug });
  return {
    ok: true,
    categoryId: category.id,
    message: "Kategori blog berhasil dibuat.",
  };
}

export async function updateBlogCategoryAction(
  id: string,
  _: BlogCategoryActionState,
  formData: FormData
): Promise<BlogCategoryActionState> {
  await requireBlogPermission(PERMISSIONS.BLOG_EDIT);

  const parsed = blogCategorySchema.safeParse(parseFormData(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: "Periksa input kategori.",
      errors: validationErrors(parsed.error.issues),
    };
  }

  const data = parsed.data;
  const existing = await prisma.blogCategory.findFirst({
    where: { slug: data.slug, NOT: { id } },
    select: { id: true },
  });
  if (existing) {
    return {
      ok: false,
      message: "Slug kategori sudah digunakan.",
      errors: { slug: "Slug sudah digunakan" },
    };
  }

  const current = await prisma.blogCategory.findUnique({
    where: { id },
    select: {
      slug: true,
      posts: { select: { slug: true } },
    },
  });

  const category = await prisma.blogCategory.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
    },
    select: { id: true, slug: true },
  });

  revalidateBlogCategorySurfaces({
    slug: category.slug,
    postSlugs: current?.posts.map((post) => post.slug),
  });
  if (current?.slug && current.slug !== category.slug) {
    revalidatePath(PUBLIC_ROUTES.blogCategory(current.slug));
  }

  return {
    ok: true,
    categoryId: category.id,
    message: "Kategori blog berhasil diperbarui.",
  };
}

export async function deleteBlogCategoryAction(id: string) {
  await requireBlogPermission(PERMISSIONS.BLOG_DELETE);

  const category = await prisma.blogCategory.findUnique({
    where: { id },
    select: {
      slug: true,
      posts: { select: { slug: true } },
    },
  });
  if (!category) {
    return { ok: false, message: "Kategori tidak ditemukan." };
  }

  await prisma.blogCategory.delete({ where: { id } });
  revalidateBlogCategorySurfaces({
    slug: category.slug,
    postSlugs: category.posts.map((post) => post.slug),
  });
  return { ok: true, message: "Kategori blog berhasil dihapus." };
}
