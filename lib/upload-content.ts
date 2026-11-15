import sharp from "sharp";

const extensions: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/zip": ".zip",
  "application/msword": ".doc",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "text/plain": ".txt",
  "text/csv": ".csv",
};

export async function validateUploadContent(buffer: Buffer, mimeType: string) {
  if (!buffer.length) throw new Error("Berkas kosong.");
  if (mimeType.startsWith("image/")) {
    const expected = {
      "image/png": "png",
      "image/jpeg": "jpeg",
      "image/webp": "webp",
      "image/gif": "gif",
    }[mimeType];
    if (!expected) throw new Error("Format gambar tidak didukung.");
    const image = sharp(buffer, {
      failOn: "error",
      limitInputPixels: 40000000,
      animated: false,
    });
    const metadata = await image.metadata();
    if (metadata.format !== expected)
      throw new Error("Isi berkas tidak sesuai tipe gambar.");
    // Decode and re-encode every image, including small ones; strips trailing active payloads.
    const output = await image
      .rotate()
      .resize({ width: 2400, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
    return { buffer: output, mimeType: "image/webp", ext: ".webp" };
  }
  const ext = extensions[mimeType];
  if (!ext) throw new Error("Format berkas tidak didukung.");
  const head = buffer.subarray(0, 8);
  if (ext === ".pdf" && !head.toString().startsWith("%PDF-"))
    throw new Error("Dokumen PDF tidak valid.");
  if (
    [".zip", ".docx", ".xlsx"].includes(ext) &&
    !["504b0304", "504b0506", "504b0708"].includes(
      head.subarray(0, 4).toString("hex")
    )
  )
    throw new Error("Arsip dokumen tidak valid.");
  if (
    [".doc", ".xls"].includes(ext) &&
    head.toString("hex") !== "d0cf11e0a1b11ae1"
  )
    throw new Error("Dokumen Office tidak valid.");
  if ([".txt", ".csv"].includes(ext))
    new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  return { buffer, mimeType, ext };
}
