"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/permissions";
import { ADMIN_ROUTES, DASHBOARD_ROUTES } from "@/lib/routes";

// --- Helpers ---
async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role)) throw new Error("Unauthorized");
  return session;
}

// --- ProjectType CRUD ---
export async function upsertProjectType(id: string | null, data: {
  name: string; slug: string; description?: string; basePrice: number;
  icon: string; dependentFields: unknown[]; order: number; active: boolean;
}) {
  await requireAdmin();
  const payload = { ...data, dependentFields: data.dependentFields as any };
  if (id) {
    await prisma.projectType.update({ where: { id }, data: payload });
  } else {
    await prisma.projectType.create({ data: payload });
  }
  revalidatePath(ADMIN_ROUTES.calculator);
}

export async function deleteProjectType(id: string) {
  await requireAdmin();
  await prisma.projectType.delete({ where: { id } });
  revalidatePath(ADMIN_ROUTES.calculator);
}

// --- FeatureOption CRUD ---
export async function upsertFeatureOption(id: string | null, data: {
  name: string; description?: string; price: number; isMajor: boolean;
  disclaimer?: string; projectTypeId?: string | null; order: number; active: boolean;
}) {
  await requireAdmin();
  if (id) {
    await prisma.featureOption.update({ where: { id }, data });
  } else {
    await prisma.featureOption.create({ data });
  }
  revalidatePath(ADMIN_ROUTES.calculator);
}

export async function deleteFeatureOption(id: string) {
  await requireAdmin();
  await prisma.featureOption.delete({ where: { id } });
  revalidatePath(ADMIN_ROUTES.calculator);
}

// --- AddOnOption CRUD ---
export async function upsertAddOnOption(id: string | null, data: {
  name: string; description?: string; pricePerMonth: number;
  minMonths: number; maxMonths: number; projectTypeId?: string | null; order: number; active: boolean;
}) {
  await requireAdmin();
  if (id) {
    await prisma.addOnOption.update({ where: { id }, data });
  } else {
    await prisma.addOnOption.create({ data });
  }
  revalidatePath(ADMIN_ROUTES.calculator);
}

export async function deleteAddOnOption(id: string) {
  await requireAdmin();
  await prisma.addOnOption.delete({ where: { id } });
  revalidatePath(ADMIN_ROUTES.calculator);
}

// --- CalculatorConfig ---
export async function updateCalculatorConfig(data: {
  featureDisclaimer: string; revisionPolicy: string; freeRevisions: number;
  revisionPricePerItem: number; urgencyMultiplier: number; urgencyThresholdDays: number;
}) {
  await requireAdmin();
  await prisma.calculatorConfig.upsert({
    where: { id: "calculator" },
    update: data,
    create: { id: "calculator", ...data },
  });
  revalidatePath(ADMIN_ROUTES.calculator);
}

// --- OrderRequest ---
export async function submitOrderRequest(data: {
  projectTypeId: string; features: string[]; customFeatures: { name: string; description: string }[];
  addOns: { addOnId: string; months: number }[]; dependentValues: Record<string, number>;
  urgency: string; deadline?: string; notes?: string; estimatedTotal: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.orderRequest.create({
    data: {
      userId: session.user.id,
      projectTypeId: data.projectTypeId,
      features: data.features,
      customFeatures: data.customFeatures,
      addOns: data.addOns,
      dependentValues: data.dependentValues,
      urgency: data.urgency,
      deadline: data.deadline ? new Date(data.deadline) : null,
      notes: data.notes ?? null,
      estimatedTotal: data.estimatedTotal,
    },
  });
  revalidatePath(DASHBOARD_ROUTES.calculator);
}

export async function updateOrderRequestStatus(id: string, status: "REVIEWED" | "CONVERTED" | "CANCELLED") {
  await requireAdmin();
  await prisma.orderRequest.update({ where: { id }, data: { status } });
  revalidatePath(ADMIN_ROUTES.orders);
}
