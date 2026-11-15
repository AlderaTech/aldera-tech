import { downloadFile } from "@/lib/file-download";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return downloadFile({ id: (await context.params).id });
}
