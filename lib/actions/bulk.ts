"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/permissions";
import { ADMIN_ROUTES, DASHBOARD_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";
import type { InvoiceStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session.user;
}

// ---- Blog bulk actions ----
export async function bulkBlogPublishAction(ids: string[], publish: boolean) {
  await requireAdmin();
  if (ids.length === 0) return { ok: true, count: 0 };
  const now = new Date();
  const result = await prisma.blogPost.updateMany({
    where: { id: { in: ids } },
    data: {
      published: publish,
      publishedAt: publish ? now : null,
    },
  });
  revalidatePath(PUBLIC_ROUTES.blog);
  revalidatePath(ADMIN_ROUTES.blog);
  return { ok: true, count: result.count };
}

export async function bulkBlogDeleteAction(ids: string[]) {
  await requireAdmin();
  if (ids.length === 0) return { ok: true, count: 0 };
  const result = await prisma.blogPost.deleteMany({
    where: { id: { in: ids } },
  });
  revalidatePath(PUBLIC_ROUTES.blog);
  revalidatePath(ADMIN_ROUTES.blog);
  return { ok: true, count: result.count };
}

// ---- Invoice bulk actions ----
export async function bulkInvoiceStatusAction(
  ids: string[],
  status: InvoiceStatus
) {
  await requireAdmin();
  if (ids.length === 0) return { ok: true, count: 0 };
  const result = await prisma.invoice.updateMany({
    where: { id: { in: ids } },
    data: {
      status,
      paidAt: status === "PAID" ? new Date() : null,
    },
  });
  revalidatePath(ADMIN_ROUTES.invoices);
  revalidatePath(DASHBOARD_ROUTES.invoices);
  return { ok: true, count: result.count };
}

export async function bulkInvoiceDeleteAction(ids: string[]) {
  await requireAdmin();
  if (ids.length === 0) return { ok: true, count: 0 };
  const result = await prisma.invoice.deleteMany({
    where: { id: { in: ids } },
  });
  revalidatePath(ADMIN_ROUTES.invoices);
  return { ok: true, count: result.count };
}
