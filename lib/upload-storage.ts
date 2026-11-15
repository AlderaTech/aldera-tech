import { resolve } from "node:path";
import type { FileScope } from "@prisma/client";

/** Runtime data directories are shared with Docker volumes and excluded from image builds. */
export function getUploadRoot(scope: FileScope) {
  return scope === "PUBLIC_MEDIA" || scope === "PRIVATE_LEGACY"
    ? resolve("public", "uploads")
    : resolve("storage", "private-uploads");
}
