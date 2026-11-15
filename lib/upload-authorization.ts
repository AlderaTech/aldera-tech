import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAdmin, isStaff } from "@/lib/permissions";
import { queryRouter } from "@/lib/router-db";
import { uploadContextSchema } from "@/lib/validations/upload";

type UploadAccess =
  | { ok: true; projectId: string | null; proof: boolean }
  | { ok: false; status: number; error: string };

export async function authorizeUpload(
  formData: FormData,
  user: { id: string; role?: Role; roles?: Role[] }
): Promise<UploadAccess> {
  const parsed = uploadContextSchema.safeParse({
    projectId: formData.get("projectId"),
    invoiceId: formData.get("invoiceId"),
    topupId: formData.get("topupId"),
  });
  if (!parsed.success)
    return {
      ok: false,
      status: 400,
      error:
        "Tujuan unggahan tidak valid. Gunakan satu ID proyek, invoice, atau top-up.",
    };
  const { projectId, invoiceId, topupId } = parsed.data;
  const staff = isStaff(user.roles ?? user.role);
  if (invoiceId) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { clientId: true, projectId: true, status: true },
    });
    if (
      !invoice ||
      (invoice.clientId !== user.id && !isAdmin(user.roles ?? user.role))
    )
      return { ok: false, status: 403, error: "Forbidden" };
    if (!["SENT", "OVERDUE", "PENDING_VERIFICATION"].includes(invoice.status))
      return {
        ok: false,
        status: 400,
        error: "Invoice ini tidak menerima bukti pembayaran.",
      };
    return { ok: true, projectId: invoice.projectId, proof: true };
  }
  if (topupId !== undefined) {
    const result = await queryRouter<{ id: number }>(
      `SELECT t.id FROM topup_requests t JOIN users u ON u.id = t.user_id
       WHERE t.id = $1 AND u.web_user_id = $2 AND t.status = 'pending' LIMIT 1`,
      [topupId, user.id]
    );
    if (!result.rows.length)
      return {
        ok: false,
        status: 403,
        error: "Tiket top-up tidak ditemukan atau tidak dapat diakses.",
      };
    return { ok: true, projectId: null, proof: true };
  }
  if (projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { clientId: true },
    });
    if (!project || (!staff && project.clientId !== user.id))
      return { ok: false, status: 403, error: "Forbidden" };
    return { ok: true, projectId, proof: false };
  }
  if (!staff)
    return {
      ok: false,
      status: 400,
      error:
        "ProjectId wajib disertakan untuk pengguna non-staff, atau gunakan invoiceId/topupId milik Anda.",
    };
  return { ok: true, projectId: null, proof: false };
}
