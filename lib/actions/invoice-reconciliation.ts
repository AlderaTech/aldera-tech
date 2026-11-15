"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission, PERMISSIONS } from "@/lib/permissions";
import { applyInvoiceBalanceEffect } from "@/lib/invoice-balance-effects";
import { transactionRouter } from "@/lib/router-db";
import { ADMIN_ROUTES } from "@/lib/routes";

export async function retryInvoiceReconciliation(id: string) {
  await requirePermission(PERMISSIONS.INVOICE_EDIT);
  const status = await applyInvoiceBalanceEffect(id);
  revalidatePath(ADMIN_ROUTES.aiRelay);
  return { status };
}

export async function restoreReviewedAiAccess(clientId: string) {
  const actor = await requirePermission(PERMISSIONS.INVOICE_EDIT);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: clientId } });
  if (!user.isActive) throw new Error("Akun pengguna masih dinonaktifkan.");
  await transactionRouter(async (client) => {
    await client.query(
      "SELECT id FROM users WHERE web_user_id = $1 FOR UPDATE",
      [clientId]
    );
    const unresolved = await prisma.invoiceBalanceEffect.count({
      where: {
        invoice: { clientId },
        kind: "REFUND",
        status: { not: "APPLIED" },
      },
    });
    if (unresolved)
      throw new Error(
        "Selesaikan rekonsiliasi refund sebelum membuka akses AI."
      );
    await client.query(
      "UPDATE users SET is_active = true, updated_at = NOW() WHERE web_user_id = $1",
      [clientId]
    );
  });
  await prisma.auditLog.create({
    data: {
      userId: actor.id,
      action: "AI_ACCESS_RESTORED",
      entityType: "User",
      entityId: clientId,
    },
  });
  revalidatePath(ADMIN_ROUTES.aiRelay);
  return { ok: true };
}
