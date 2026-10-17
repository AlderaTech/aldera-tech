"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { isStaff } from "@/lib/permissions";
import { calculateOrderTotal } from "@/lib/calculator-utils";
import { ADMIN_ROUTES, DASHBOARD_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";

// --- Helpers ---
async function requireAdmin() {
  const session = await auth();
  if (!session?.user || !isStaff(session.user.role))
    throw new Error("Unauthorized");
  return session;
}

function revalidateCalculator() {
  revalidatePath(ADMIN_ROUTES.calculator);
  revalidatePath(PUBLIC_ROUTES.pricing);
}

// --- ProjectType CRUD ---
export async function upsertProjectType(
  id: string | null,
  data: {
    name: string;
    slug: string;
    description?: string;
    basePrice: number;
    icon: string;
    dependentFields: Prisma.InputJsonValue;
    order: number;
    active: boolean;
  }
) {
  await requireAdmin();
  const payload = { ...data, dependentFields: data.dependentFields };
  if (id) {
    await prisma.projectType.update({ where: { id }, data: payload });
  } else {
    await prisma.projectType.create({ data: payload });
  }
  revalidateCalculator();
}

export async function deleteProjectType(id: string) {
  await requireAdmin();
  await prisma.projectType.delete({ where: { id } });
  revalidateCalculator();
}

// --- FeatureOption CRUD ---
export async function upsertFeatureOption(
  id: string | null,
  data: {
    name: string;
    description?: string;
    price: number;
    isMajor: boolean;
    disclaimer?: string;
    projectTypeId?: string | null;
    order: number;
    active: boolean;
  }
) {
  await requireAdmin();
  if (id) {
    await prisma.featureOption.update({ where: { id }, data });
  } else {
    await prisma.featureOption.create({ data });
  }
  revalidateCalculator();
}

export async function deleteFeatureOption(id: string) {
  await requireAdmin();
  await prisma.featureOption.delete({ where: { id } });
  revalidateCalculator();
}

// --- AddOnOption CRUD ---
export async function upsertAddOnOption(
  id: string | null,
  data: {
    name: string;
    description?: string;
    pricePerMonth: number;
    minMonths: number;
    maxMonths: number;
    projectTypeId?: string | null;
    order: number;
    active: boolean;
  }
) {
  await requireAdmin();
  if (id) {
    await prisma.addOnOption.update({ where: { id }, data });
  } else {
    await prisma.addOnOption.create({ data });
  }
  revalidateCalculator();
}

export async function deleteAddOnOption(id: string) {
  await requireAdmin();
  await prisma.addOnOption.delete({ where: { id } });
  revalidateCalculator();
}

// --- CalculatorConfig ---
export async function updateCalculatorConfig(data: {
  featureDisclaimer: string;
  revisionPolicy: string;
  freeRevisions: number;
  revisionPricePerItem: number;
  urgencyMultiplier: number;
  urgencyThresholdDays: number;
  dpPercentage: number;
}) {
  await requireAdmin();
  await prisma.calculatorConfig.upsert({
    where: { id: "calculator" },
    update: data,
    create: { id: "calculator", ...data },
  });
  revalidateCalculator();
}

// --- OrderRequest ---
export const submitOrderRequestSchema = z.object({
  projectTypeId: z.string().min(1, "Tipe proyek wajib dipilih"),
  features: z.array(z.string()).default([]),
  customFeatures: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional().default(""),
      })
    )
    .default([]),
  addOns: z
    .array(
      z.object({
        addOnId: z.string().min(1),
        months: z.number().int().default(1),
      })
    )
    .default([]),
  dependentValues: z.record(z.string(), z.number()).default({}),
  urgency: z.string().default("normal"),
  deadline: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  estimatedTotal: z.number().optional(),
});

export type SubmitOrderRequestInput = z.infer<typeof submitOrderRequestSchema>;

export async function submitOrderRequest(data: {
  projectTypeId: string;
  features: string[];
  customFeatures: { name: string; description: string }[];
  addOns: { addOnId: string; months: number }[];
  dependentValues: Record<string, number>;
  urgency: string;
  deadline?: string;
  notes?: string;
  estimatedTotal?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const parsed = submitOrderRequestSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Data order tidak valid");
  }
  const validData = parsed.data;

  // Filter out custom features with empty/whitespace names
  const cleanCustomFeatures = validData.customFeatures.filter(
    (cf) => cf.name && cf.name.trim().length > 0
  );

  // 1. Query project type
  const projectType = await prisma.projectType.findUnique({
    where: { id: validData.projectTypeId },
  });
  if (!projectType) {
    throw new Error("Tipe proyek tidak ditemukan");
  }
  const basePrice = Number(projectType.basePrice);

  // 2. Dependent fields
  const depFields = Array.isArray(projectType.dependentFields)
    ? (projectType.dependentFields as Array<{ label?: string; pricePerUnit?: number }>)
    : [];
  const dependentFieldItems = depFields.map((field) => ({
    value: (field.label && validData.dependentValues[field.label]) || 0,
    pricePerUnit: Number(field.pricePerUnit || 0),
  }));

  // 3. Features
  const dbFeatures = await prisma.featureOption.findMany({
    where: {
      id: { in: validData.features },
      active: true,
    },
  });
  const featurePrices = dbFeatures.map((f) => Number(f.price));

  // 4. Custom feature standard unit price
  const stdFeature = await prisma.featureOption.findFirst({
    where: { isMajor: false, active: true },
    orderBy: { order: "asc" },
  });
  const customFeaturePrice = stdFeature ? Number(stdFeature.price) : 500000;

  // 5. Add-ons: clamp months to [addOn.minMonths, addOn.maxMonths]
  const addOnIds = validData.addOns.map((a) => a.addOnId);
  const dbAddOns = await prisma.addOnOption.findMany({
    where: {
      id: { in: addOnIds },
      active: true,
    },
  });

  const clampedAddOns: Array<{ addOnId: string; months: number }> = [];
  const addOnCalcParams: Array<{ pricePerMonth: number; months: number }> = [];

  for (const userAddOn of validData.addOns) {
    const dbAddOn = dbAddOns.find((a) => a.id === userAddOn.addOnId);
    if (!dbAddOn) continue;
    const minM = dbAddOn.minMonths ?? 1;
    const maxM = dbAddOn.maxMonths ?? 12;
    const clampedMonths = Math.max(minM, Math.min(maxM, userAddOn.months));
    clampedAddOns.push({
      addOnId: dbAddOn.id,
      months: clampedMonths,
    });
    addOnCalcParams.push({
      pricePerMonth: Number(dbAddOn.pricePerMonth),
      months: clampedMonths,
    });
  }

  // 6. Urgency multiplier from config
  const config = await prisma.calculatorConfig.findUnique({
    where: { id: "calculator" },
  });
  const urgencyMultiplier = config?.urgencyMultiplier
    ? Number(config.urgencyMultiplier)
    : 1.5;

  // 7. Authoritative server recalculation (client-supplied estimatedTotal is completely ignored)
  const authoritativeTotal = calculateOrderTotal({
    basePrice,
    dependentFields: dependentFieldItems,
    featurePrices,
    customFeatureCount: cleanCustomFeatures.length,
    customFeaturePrice,
    addOns: addOnCalcParams,
    urgency: validData.urgency === "urgent" ? "urgent" : "normal",
    urgencyMultiplier,
  });

  await prisma.orderRequest.create({
    data: {
      userId: session.user.id,
      projectTypeId: projectType.id,
      features: validData.features,
      customFeatures: cleanCustomFeatures,
      addOns: clampedAddOns,
      dependentValues: validData.dependentValues,
      urgency: validData.urgency,
      deadline: validData.deadline ? new Date(validData.deadline) : null,
      notes: validData.notes ?? null,
      estimatedTotal: authoritativeTotal,
    },
  });
  revalidatePath(PUBLIC_ROUTES.pricing);
  revalidatePath(DASHBOARD_ROUTES.orders);
}

export async function updateOrderRequestStatus(
  id: string,
  status: "REVIEWED" | "CONVERTED" | "CANCELLED"
) {
  await requireAdmin();
  await prisma.orderRequest.update({ where: { id }, data: { status } });
  revalidatePath(ADMIN_ROUTES.orders);
}
