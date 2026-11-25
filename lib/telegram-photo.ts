import { getTelegramConfig } from "@/lib/telegram";
import { telegramFileSchema } from "@/lib/validations/relay";

const MAX_PHOTO_SIZE = 20 * 1024 * 1024;

async function readPhoto(response: Response) {
  const body = response.body;
  if (!body) return null;
  if (Number(response.headers.get("content-length")) > MAX_PHOTO_SIZE) {
    await body.cancel();
    return null;
  }

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return Buffer.concat(chunks, size);
      size += value.byteLength;
      if (size > MAX_PHOTO_SIZE) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
}

function photoMimeType(bytes: Buffer) {
  if (bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    return "image/jpeg";
  }
  if (
    bytes
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }
  if (
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export async function getTelegramPhoto(fileId: string) {
  const { baseUrl, botToken } = getTelegramConfig();
  if (!botToken) throw new Error("Telegram credentials unavailable");

  const options = {
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
    redirect: "error",
  } as const;
  const info = await fetch(`${baseUrl}/bot${botToken}/getFile`, {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_id: fileId }),
  });
  if (!info.ok) {
    await info.body?.cancel();
    return null;
  }

  const file = telegramFileSchema.safeParse(await info.json());
  if (!file.success) return null;
  const parts = file.data.result.file_path.split("/");
  if (
    parts.some(
      (part) => !/^[\w.-]+$/.test(part) || part === "." || part === ".."
    )
  )
    return null;

  const response = await fetch(
    `${baseUrl}/file/bot${botToken}/${parts.join("/")}`,
    options
  );
  if (!response.ok) {
    await response.body?.cancel();
    return null;
  }
  const bytes = await readPhoto(response);
  if (!bytes) return null;

  const mimeType = photoMimeType(bytes);
  return mimeType ? { bytes: new Uint8Array(bytes), mimeType } : null;
}
