import { NextResponse, type NextRequest } from "next/server";
import { writeFile, mkdir, unlink } from "node:fs/promises";
import { join, extname } from "node:path";
import { randomUUID } from "node:crypto";
import { validateUploadContent } from "@/lib/upload-content";
import { API_ROUTES } from "@/lib/routes";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUploadRoot } from "@/lib/upload-storage";
import { authorizeUpload } from "@/lib/upload-authorization";
import { notify } from "@/lib/notifications";

export const runtime = "nodejs";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "text/plain",
  "text/csv",
]);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  let access: Awaited<ReturnType<typeof authorizeUpload>>;
  try {
    access = await authorizeUpload(formData, session.user);
  } catch (error) {
    console.error("Upload authorization failed:", error);
    return NextResponse.json(
      { error: "Gagal memverifikasi akses unggahan." },
      { status: 503 }
    );
  }
  if (!access.ok)
    return NextResponse.json(
      { error: access.error },
      { status: access.status }
    );

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_SIZE / 1024 / 1024}MB)` },
      { status: 413 }
    );
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported mime type: ${file.type}` },
      { status: 415 }
    );
  }

  let buffer: Buffer = Buffer.from(await file.arrayBuffer());
  if (
    access.proof &&
    !["image/png", "image/jpeg", "image/webp", "application/pdf"].includes(
      file.type
    )
  ) {
    return NextResponse.json(
      { error: "Bukti transfer harus berupa PNG, JPEG, WebP, atau PDF." },
      { status: 415 }
    );
  }
  let validated: Awaited<ReturnType<typeof validateUploadContent>>;
  try {
    validated = await validateUploadContent(buffer, file.type);
  } catch {
    return NextResponse.json(
      { error: "Isi berkas tidak sesuai format yang diizinkan." },
      { status: 415 }
    );
  }
  buffer = Buffer.from(validated.buffer);
  const savedMimeType = validated.mimeType;
  const savedExt = validated.ext;
  const invoiceId = String(formData.get("invoiceId") || "") || null;
  const topupId = formData.get("topupId")
    ? Number(formData.get("topupId"))
    : null;
  const scope = invoiceId
    ? "INVOICE_PROOF"
    : topupId
      ? "TOPUP_PROOF"
      : access.projectId
        ? "PROJECT"
        : "PUBLIC_MEDIA";
  const fileId = randomUUID();
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const safeBase = file.name
    .replace(extname(file.name), "")
    .replace(/[^a-zA-Z0-9-_.]+/g, "-")
    .slice(0, 60);
  const filename = `${randomUUID()}-${safeBase}${savedExt}`;
  const relativePath = `${year}/${month}/${filename}`;
  const root = getUploadRoot(scope);
  const dir = join(root, year, month);
  const fullPath = join(dir, filename);

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(fullPath, new Uint8Array(buffer));
  } catch (err) {
    console.error("Upload write error:", err);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }

  const url =
    scope === "PUBLIC_MEDIA"
      ? API_ROUTES.publicUpload(relativePath)
      : API_ROUTES.fileDownload(fileId, filename);

  const targetProjectId = access.projectId;

  let fileRecord: { id: string } | null = null;
  try {
    fileRecord = await prisma.file.create({
      data: {
        id: fileId,
        scope,
        invoiceId,
        topupId,
        filename,
        originalName: file.name,
        mimeType: savedMimeType,
        size: buffer.byteLength,
        path: relativePath,
        url,
        uploaderId: session.user.id,
        projectId: targetProjectId,
      },
      select: { id: true },
    });
  } catch (err) {
    console.error("Upload DB error:", err);
    try {
      await unlink(fullPath);
    } catch (cleanupError) {
      console.error("Upload rollback failed:", cleanupError);
    }
    return NextResponse.json(
      { error: "Gagal menyimpan data berkas. Silakan unggah ulang." },
      { status: 500 }
    );
  }

  // Log ActivityAction.FILE_UPLOADED and call notify() on upload
  try {
    if (targetProjectId) {
      const project = await prisma.project.findUnique({
        where: { id: targetProjectId },
        select: { id: true, title: true, clientId: true },
      });

      await prisma.activityLog.create({
        data: {
          projectId: targetProjectId,
          userId: session.user.id,
          action: "FILE_UPLOADED",
          description: `Berkas ${file.name} telah diunggah.`,
          metadata: {
            fileId: fileRecord?.id,
            filename,
            originalName: file.name,
            mimeType: savedMimeType,
            size: buffer.byteLength,
            url,
          },
        },
      });

      const notifyUserId =
        project?.clientId && project.clientId !== session.user.id
          ? project.clientId
          : session.user.id;

      await notify({
        userId: notifyUserId,
        type: "FILE_UPLOADED",
        title: "Berkas Baru Diunggah",
        message:
          `Berkas ${file.name} telah diunggah pada proyek ${project?.title ?? ""}.`.trim(),
        metadata: {
          projectId: targetProjectId,
          fileId: fileRecord?.id,
          url,
        },
      });
    } else {
      await notify({
        userId: session.user.id,
        type: "FILE_UPLOADED",
        title: "Berkas Baru Diunggah",
        message: `Berkas ${file.name} telah berhasil diunggah.`,
        metadata: {
          fileId: fileRecord?.id,
          url,
        },
      });
    }
  } catch (err) {
    console.error("Upload activity/notification error:", err);
  }

  return NextResponse.json({
    id: fileRecord?.id ?? null,
    url,
    filename,
    originalName: file.name,
    mimeType: savedMimeType,
    size: buffer.byteLength,
    originalSize: file.size,
    optimized: buffer.byteLength !== file.size,
  });
}
