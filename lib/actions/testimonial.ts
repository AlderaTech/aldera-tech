"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  testimonialSchema,
  clientProjectReviewSchema,
} from "@/lib/validations/testimonial";
import { isStaff } from "@/lib/permissions";
import { ADMIN_ROUTES, DASHBOARD_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";

export type TestimonialActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  testimonialId?: string;
};

async function requireStaffUser() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session.user;
}

function parseTestimonialFormData(formData: FormData) {
  return {
    clientName: formData.get("clientName"),
    clientRole: formData.get("clientRole") || "",
    content: formData.get("content"),
    rating: formData.get("rating") || 5,
    avatar: formData.get("avatar") || "",
    published:
      formData.get("published") === "on" ||
      formData.get("published") === "true",
    order: formData.get("order") || 0,
    projectId: formData.get("projectId") || "",
  };
}

export async function createTestimonialAction(
  _: TestimonialActionState,
  formData: FormData
): Promise<TestimonialActionState> {
  await requireStaffUser();

  const parsed = testimonialSchema.safeParse(
    parseTestimonialFormData(formData)
  );
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) errors[issue.path[0] as string] = issue.message;
    }
    return { ok: false, message: "Mohon periksa data testimoni.", errors };
  }

  const data = parsed.data;

  const created = await prisma.testimonial.create({
    data: {
      clientName: data.clientName,
      clientRole: data.clientRole || null,
      content: data.content,
      rating: data.rating,
      avatar: data.avatar || null,
      published: data.published,
      order: data.order,
      projectId: data.projectId || null,
    },
    select: { id: true },
  });

  revalidatePath(ADMIN_ROUTES.testimonials);
  revalidatePath(PUBLIC_ROUTES.testimonials);
  revalidatePath(PUBLIC_ROUTES.home);

  return {
    ok: true,
    message: "Testimoni berhasil ditambahkan.",
    testimonialId: created.id,
  };
}

export async function updateTestimonialAction(
  id: string,
  _: TestimonialActionState,
  formData: FormData
): Promise<TestimonialActionState> {
  await requireStaffUser();

  const parsed = testimonialSchema.safeParse(
    parseTestimonialFormData(formData)
  );
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) errors[issue.path[0] as string] = issue.message;
    }
    return { ok: false, message: "Mohon periksa data testimoni.", errors };
  }

  const data = parsed.data;

  await prisma.testimonial.update({
    where: { id },
    data: {
      clientName: data.clientName,
      clientRole: data.clientRole || null,
      content: data.content,
      rating: data.rating,
      avatar: data.avatar || null,
      published: data.published,
      order: data.order,
      projectId: data.projectId || null,
    },
  });

  revalidatePath(ADMIN_ROUTES.testimonials);
  revalidatePath(PUBLIC_ROUTES.testimonials);
  revalidatePath(PUBLIC_ROUTES.home);

  return { ok: true, message: "Testimoni berhasil diperbarui." };
}

export async function deleteTestimonialAction(
  id: string
): Promise<{ ok: boolean; message?: string }> {
  await requireStaffUser();

  await prisma.testimonial.delete({ where: { id } });

  revalidatePath(ADMIN_ROUTES.testimonials);
  revalidatePath(PUBLIC_ROUTES.testimonials);
  revalidatePath(PUBLIC_ROUTES.home);

  return { ok: true, message: "Testimoni berhasil dihapus." };
}

export async function toggleTestimonialPublishAction(
  id: string,
  published: boolean
): Promise<{ ok: boolean; message?: string }> {
  await requireStaffUser();

  await prisma.testimonial.update({
    where: { id },
    data: { published },
  });

  revalidatePath(ADMIN_ROUTES.testimonials);
  revalidatePath(PUBLIC_ROUTES.testimonials);
  revalidatePath(PUBLIC_ROUTES.home);

  return {
    ok: true,
    message: published
      ? "Testimoni dipublikasikan."
      : "Testimoni disembunyikan.",
  };
}

export async function submitProjectReviewAction(
  _: TestimonialActionState,
  formData: FormData
): Promise<TestimonialActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, message: "Sesi tidak valid. Silakan login kembali." };
  }

  const parsed = clientProjectReviewSchema.safeParse({
    projectId: formData.get("projectId"),
    rating: formData.get("rating"),
    content: formData.get("content"),
    clientRole: formData.get("clientRole") || "",
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0]) errors[issue.path[0] as string] = issue.message;
    }
    return { ok: false, message: "Mohon periksa data ulasan Anda.", errors };
  }

  const { projectId, rating, content, clientRole } = parsed.data;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, title: true, clientId: true, status: true },
  });

  if (!project) {
    return { ok: false, message: "Proyek tidak ditemukan." };
  }

  if (project.clientId !== session.user.id && session.user.role !== "ADMIN") {
    return { ok: false, message: "Anda tidak memiliki akses ke proyek ini." };
  }

  if (project.status !== "COMPLETED") {
    return {
      ok: false,
      message: "Ulasan hanya dapat dikirim untuk proyek yang telah selesai.",
    };
  }

  const testimonial = await prisma.testimonial.upsert({
    where: { projectId: project.id },
    create: {
      projectId: project.id,
      clientId: session.user.id,
      clientName: session.user.name || "Klien Aldera Tech",
      clientRole: clientRole || null,
      content,
      rating,
      avatar: session.user.image || null,
      published: false,
      order: 99,
    },
    update: {
      content,
      rating,
      clientRole: clientRole || null,
      avatar: session.user.image || undefined,
    },
  });

  await prisma.activityLog.create({
    data: {
      projectId: project.id,
      userId: session.user.id,
      action: "PROJECT_UPDATED",
      description: `Klien memberikan rating ${rating}/5 bintang dan testimoni proyek.`,
      metadata: {
        projectId: project.id,
        rating,
        testimonialId: testimonial.id,
      },
    },
  });

  revalidatePath(DASHBOARD_ROUTES.projectDetail(project.id));
  revalidatePath(ADMIN_ROUTES.testimonials);
  revalidatePath(PUBLIC_ROUTES.testimonials);

  return {
    ok: true,
    message: "Terima kasih! Ulasan dan rating Anda berhasil disimpan.",
    testimonialId: testimonial.id,
  };
}

export const submitProjectTestimonialAction = submitProjectReviewAction;
