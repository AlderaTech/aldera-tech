import { auth } from "@/auth";
import { downloadFile } from "@/lib/file-download";
import { isAdmin } from "@/lib/permissions";
import { queryRouter } from "@/lib/router-db";
import { getTelegramPhoto } from "@/lib/telegram-photo";

export const runtime = "nodejs";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store",
  Vary: "Cookie",
};

function unavailable(status: number) {
  return new Response("Bukti transfer belum bisa ditampilkan.", {
    status,
    headers: PRIVATE_HEADERS,
  });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return unavailable(401);
  if (!isAdmin(session.user.roles ?? session.user.role))
    return unavailable(403);

  const { id } = await context.params;
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id)))
    return unavailable(404);

  try {
    const { rows } = await queryRouter<{ proof_file_id: string | null }>(
      "SELECT proof_file_id FROM topup_requests WHERE id = $1 AND status = 'pending'",
      [id]
    );
    const fileId = rows[0]?.proof_file_id;
    if (!fileId) return unavailable(404);

    // Web uploads store a Prisma CUID. Telegram stores an opaque PhotoSize.file_id.
    if (/^c[a-z0-9]{24}$/.test(fileId)) {
      return downloadFile({ id: fileId });
    }
    if (!/^[a-zA-Z0-9_-]{1,512}$/.test(fileId)) return unavailable(404);

    const photo = await getTelegramPhoto(fileId);
    if (!photo) return unavailable(404);
    return new Response(photo.bytes, {
      headers: {
        ...PRIVATE_HEADERS,
        "Content-Type": photo.mimeType,
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "sandbox; default-src 'none'",
      },
    });
  } catch {
    // Telegram transport errors may contain the Bot API URL and token.
    console.warn("[TopupProof] Could not load proof for ticket", id);
    return unavailable(503);
  }
}
