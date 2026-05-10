import { NextResponse, type NextRequest } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "text/plain",
  "text/csv",
]);

// Images above this threshold get optimized; SVG is passed through untouched.
const OPTIMIZE_THRESHOLD = 200 * 1024; // 200KB
const MAX_WIDTH = 2400;

async function optimizeImageBuffer(
  buffer: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; mimeType: string; ext: string }> {
  try {
    const image = sharp(buffer, { failOn: "truncated" });
    const metadata = await image.metadata();

    // Downscale if too wide
    if (metadata.width && metadata.width > MAX_WIDTH) {
      image.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    }

    // PNG with transparency → keep PNG; everything else → WebP for smaller size.
    const hasAlpha =
      mimeType === "image/png" && metadata.hasAlpha === true;

    if (hasAlpha) {
      const out = await image
        .png({ compressionLevel: 9, palette: true })
        .toBuffer();
      return { buffer: out, mimeType: "image/png", ext: ".png" };
    }

    const out = await image
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
    return { buffer: out, mimeType: "image/webp", ext: ".webp" };
  } catch (err) {
    console.warn("[upload] sharp optimize failed, using original:", err);
    return {
      buffer,
      mimeType,
      ext: mimeType === "image/jpeg" ? ".jpg" : mimeType === "image/png" ? ".png" : ".bin",
    };
  }
}

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
  const projectId = formData.get("projectId");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

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
  let savedMimeType = file.type;
  let savedExt = extname(file.name) || "";

  // Run sharp for raster images above threshold. SVG is left untouched.
  const isRasterImage =
    file.type.startsWith("image/") && file.type !== "image/svg+xml";
  if (isRasterImage && buffer.byteLength > OPTIMIZE_THRESHOLD) {
    const optimized = await optimizeImageBuffer(buffer, file.type);
    buffer = Buffer.from(optimized.buffer);
    savedMimeType = optimized.mimeType;
    savedExt = optimized.ext;
  }

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const safeBase = file.name
    .replace(extname(file.name), "")
    .replace(/[^a-zA-Z0-9-_.]+/g, "-")
    .slice(0, 60);
  const filename = `${randomUUID()}-${safeBase}${savedExt}`;
  const relativePath = `${year}/${month}/${filename}`;
  const dir = join(process.cwd(), "public", "uploads", year, month);
  const fullPath = join(dir, filename);

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(fullPath, new Uint8Array(buffer));
  } catch (err) {
    console.error("Upload write error:", err);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }

  const url = `/uploads/${relativePath}`;

  let fileRecord: { id: string } | null = null;
  try {
    fileRecord = await prisma.file.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: savedMimeType,
        size: buffer.byteLength,
        path: relativePath,
        url,
        uploaderId: session.user.id,
        projectId: typeof projectId === "string" && projectId ? projectId : null,
      },
      select: { id: true },
    });
  } catch (err) {
    console.error("Upload DB error:", err);
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
