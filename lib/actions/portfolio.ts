"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { caseStudySchema } from "@/lib/validations/portfolio";
import { isStaff } from "@/lib/permissions";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";

export type PortfolioActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  caseStudyId?: string;
};

async function requireStaffUser() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session.user;
}

function parseTechStack(raw: FormDataEntryValue | null): string[] {
  if (!raw) return [];
  const str = String(raw).trim();
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed))
      return parsed.map((s) => String(s).trim()).filter(Boolean);
  } catch {
    // Comma-separated fallback
  }
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parsePortfolioFormData(formData: FormData) {
  return {
    title: formData.get("title"),
    slug: formData.get("slug"),
    client: formData.get("client"),
    industry: formData.get("industry"),
    summary: formData.get("summary"),
    challenge: formData.get("challenge"),
    solution: formData.get("solution"),
    result: formData.get("result"),
    featuredImage: formData.get("featuredImage") || "",
    techStack: parseTechStack(formData.get("techStack")),
    published:
      formData.get("published") === "on" ||
      formData.get("published") === "true",
    order: formData.get("order") || 0,
  };
}

export async function createCaseStudyAction(
  _: PortfolioActionState,
  formData: FormData
): Promise<PortfolioActionState> {
  await requireStaffUser();

  const parsed = caseStudySchema.safeParse(parsePortfolioFormData(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) errors[issue.path[0] as string] = issue.message;
    }
    return {
      ok: false,
      message: "Mohon periksa data studi kasus Anda.",
      errors,
    };
  }

  const data = parsed.data;
  const existing = await prisma.caseStudy.findUnique({
    where: { slug: data.slug },
    select: { id: true },
  });

  if (existing) {
    return {
      ok: false,
      message: "Slug sudah digunakan oleh studi kasus lain.",
      errors: { slug: "Slug sudah digunakan." },
    };
  }

  const created = await prisma.caseStudy.create({
    data: {
      title: data.title,
      slug: data.slug,
      client: data.client,
      industry: data.industry,
      summary: data.summary,
      challenge: data.challenge,
      solution: data.solution,
      result: data.result,
      featuredImage: data.featuredImage || null,
      techStack: data.techStack,
      published: data.published,
      order: data.order,
    },
    select: { id: true, slug: true },
  });

  revalidatePath(ADMIN_ROUTES.portfolio);
  revalidatePath(PUBLIC_ROUTES.portfolio);
  revalidatePath(PUBLIC_ROUTES.home);
  revalidatePath(PUBLIC_ROUTES.portfolioDetail(created.slug));

  return {
    ok: true,
    message: "Studi kasus berhasil dibuat.",
    caseStudyId: created.id,
  };
}

export async function updateCaseStudyAction(
  id: string,
  _: PortfolioActionState,
  formData: FormData
): Promise<PortfolioActionState> {
  await requireStaffUser();

  const parsed = caseStudySchema.safeParse(parsePortfolioFormData(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) errors[issue.path[0] as string] = issue.message;
    }
    return {
      ok: false,
      message: "Mohon periksa data studi kasus Anda.",
      errors,
    };
  }

  const data = parsed.data;
  const existing = await prisma.caseStudy.findFirst({
    where: { slug: data.slug, NOT: { id } },
    select: { id: true },
  });

  if (existing) {
    return {
      ok: false,
      message: "Slug sudah digunakan oleh studi kasus lain.",
      errors: { slug: "Slug sudah digunakan." },
    };
  }

  const updated = await prisma.caseStudy.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      client: data.client,
      industry: data.industry,
      summary: data.summary,
      challenge: data.challenge,
      solution: data.solution,
      result: data.result,
      featuredImage: data.featuredImage || null,
      techStack: data.techStack,
      published: data.published,
      order: data.order,
    },
    select: { id: true, slug: true },
  });

  revalidatePath(ADMIN_ROUTES.portfolio);
  revalidatePath(ADMIN_ROUTES.portfolioEdit(id));
  revalidatePath(PUBLIC_ROUTES.portfolio);
  revalidatePath(PUBLIC_ROUTES.home);
  revalidatePath(PUBLIC_ROUTES.portfolioDetail(updated.slug));

  return {
    ok: true,
    message: "Studi kasus berhasil diperbarui.",
    caseStudyId: updated.id,
  };
}

export async function deleteCaseStudyAction(
  id: string
): Promise<{ ok: boolean; message?: string }> {
  await requireStaffUser();

  const deleted = await prisma.caseStudy.delete({
    where: { id },
    select: { slug: true },
  });

  revalidatePath(ADMIN_ROUTES.portfolio);
  revalidatePath(PUBLIC_ROUTES.portfolio);
  revalidatePath(PUBLIC_ROUTES.home);
  if (deleted?.slug) {
    revalidatePath(PUBLIC_ROUTES.portfolioDetail(deleted.slug));
  }

  return { ok: true, message: "Studi kasus berhasil dihapus." };
}

export async function toggleCaseStudyPublishAction(
  id: string,
  published: boolean
): Promise<{ ok: boolean; message?: string }> {
  await requireStaffUser();

  const updated = await prisma.caseStudy.update({
    where: { id },
    data: { published },
    select: { slug: true },
  });

  revalidatePath(ADMIN_ROUTES.portfolio);
  revalidatePath(PUBLIC_ROUTES.portfolio);
  revalidatePath(PUBLIC_ROUTES.home);
  revalidatePath(PUBLIC_ROUTES.portfolioDetail(updated.slug));

  return {
    ok: true,
    message: published
      ? "Studi kasus dipublikasikan."
      : "Studi kasus disembunyikan.",
  };
}
