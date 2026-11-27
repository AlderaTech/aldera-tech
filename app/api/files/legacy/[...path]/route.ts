import { downloadFile } from "@/lib/file-download";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  return downloadFile({ path: (await context.params).path.join("/") });
}
