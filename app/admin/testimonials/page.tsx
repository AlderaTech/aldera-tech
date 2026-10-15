import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { safeDb } from "@/lib/safe-db";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { ADMIN_ROUTES, AUTH_ROUTES } from "@/lib/routes";

import { TestimonialManagement } from "./_components/testimonial-management";
import type {
  TestimonialItem,
  CompletedProjectOption,
} from "./_utils/testimonial-types";

export const metadata: Metadata = {
  title: "Manajemen Testimoni | Admin Aldera Tech",
  description:
    "Kelola ulasan, testimoni proyek, dan rating kepuasan klien untuk profil publik Aldera Tech.",
};

export default async function AdminTestimonialsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(AUTH_ROUTES.loginWithCallback(ADMIN_ROUTES.testimonials));
  }

  if (!hasPermission(session.user.role, PERMISSIONS.TESTIMONIAL_VIEW)) {
    redirect(ADMIN_ROUTES.home);
  }

  const testimonials = await safeDb<TestimonialItem[]>(
    async () => {
      const records = await prisma.testimonial.findMany({
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        include: {
          project: {
            select: { id: true, title: true },
          },
          client: {
            select: { id: true, name: true, email: true },
          },
        },
      });
      return records as TestimonialItem[];
    },
    []
  );

  const completedProjects = await safeDb<CompletedProjectOption[]>(
    async () => {
      const list = await prisma.project.findMany({
        where: { status: "COMPLETED" },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          client: {
            select: { name: true },
          },
        },
      });
      return list.map((p) => ({
        id: p.id,
        title: p.title,
        clientName: p.client?.name ?? undefined,
      }));
    },
    []
  );

  return (
    <TestimonialManagement
      testimonials={testimonials}
      completedProjects={completedProjects}
    />
  );
}
