import { readFile, realpath } from "node:fs/promises";
import { resolve, relative, isAbsolute } from "node:path";
import type { File as StoredFile, Role } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin, isStaff } from "@/lib/permissions";
import { queryRouter } from "@/lib/router-db";
import { isPublicUploadReference } from "@/lib/public-upload-classification";

export async function canReadFile(
  file: StoredFile,
  user: { id: string; roles?: Role[]; role?: Role } | null
) {
  if (file.scope === "PUBLIC_MEDIA") return true;
  if (!user) return false;
  if (isAdmin(user.roles ?? user.role)) return true;
  const invoice = await prisma.invoice.findFirst({
    where: {
      OR: [
        ...(file.invoiceId ? [{ id: file.invoiceId }] : []),
        { paymentProofUrl: file.url },
      ],
    },
    select: { clientId: true },
  });
  if (invoice) return invoice.clientId === user.id;
  if (file.scope === "INVOICE_PROOF") return false;
  if (file.topupId || file.scope === "PRIVATE_LEGACY") {
    const topup = await queryRouter<{ web_user_id: string }>(
      `SELECT u.web_user_id FROM topup_requests t JOIN users u ON u.id = t.user_id
       WHERE t.proof_file_id = $1 OR t.id = $2 LIMIT 1`,
      [file.id, file.topupId ?? null]
    );
    if (topup.rows.length) return topup.rows[0].web_user_id === user.id;
  }
  if (file.scope === "TOPUP_PROOF") return file.uploaderId === user.id;
  if (file.projectId) {
    if (isStaff(user.roles ?? user.role)) return true;
    const project = await prisma.project.findUnique({
      where: { id: file.projectId },
      select: { clientId: true },
    });
    return project?.clientId === user.id;
  }
  return file.uploaderId === user.id;
}

export async function downloadFile(where: { id: string } | { path: string }) {
  try {
    const file = await prisma.file.findFirst({ where });
    if (!file) return new Response("Not found", { status: 404 });
    if (
      file.scope === "PRIVATE_LEGACY" &&
      (await isPublicUploadReference(file.url))
    )
      file.scope = "PUBLIC_MEDIA";
    const session = file.scope === "PUBLIC_MEDIA" ? null : await auth();
    if (!(await canReadFile(file, session?.user ?? null)))
      return new Response("Forbidden", { status: 403 });
    const root = resolve(
      file.scope === "PUBLIC_MEDIA" || file.scope === "PRIVATE_LEGACY"
        ? "public/uploads"
        : process.env.PRIVATE_UPLOAD_DIR || "storage/private-uploads"
    );
    const path = resolve(root, file.path);
    const actualRoot = await realpath(root);
    const actualPath = await realpath(path);
    const child = relative(actualRoot, actualPath);
    if (!child || child.startsWith("..") || isAbsolute(child))
      return new Response("Not found", { status: 404 });
    const buffer = await readFile(actualPath);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": file.mimeType,
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": `${file.mimeType.startsWith("image/") ? "inline" : "attachment"}; filename="${encodeURIComponent(file.originalName)}"`,
        "Cache-Control":
          file.scope === "PUBLIC_MEDIA"
            ? "public, max-age=3600"
            : "private, no-store",
        "Content-Security-Policy": "sandbox; default-src 'none'",
        Vary: "Cookie",
      },
    });
  } catch {
    return new Response("Berkas belum dapat diakses.", { status: 503 });
  }
}
