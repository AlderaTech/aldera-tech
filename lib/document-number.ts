import type { Prisma } from "@prisma/client";
import { lockAccountKey } from "@/lib/account-locks";

/** Call inside the same transaction that persists the numbered document. */
export async function nextDocumentNumber(
  tx: Prisma.TransactionClient,
  kind: "invoice" | "proposal",
  now = new Date()
) {
  const prefix = `${kind === "invoice" ? "INV" : "PROP"}-${now.getFullYear()}`;
  await lockAccountKey(tx, `document:${prefix}`);
  const pattern = `^${prefix}-[0-9]+$`;
  const rows =
    kind === "invoice"
      ? await tx.$queryRaw<
          Array<{ sequence: string }>
        >`SELECT COALESCE(MAX(SPLIT_PART("number", '-', 3)::numeric), 0)::text AS sequence FROM "Invoice" WHERE "number" ~ ${pattern}`
      : await tx.$queryRaw<
          Array<{ sequence: string }>
        >`SELECT COALESCE(MAX(SPLIT_PART("number", '-', 3)::numeric), 0)::text AS sequence FROM "Proposal" WHERE "number" ~ ${pattern}`;
  return `${prefix}-${(BigInt(rows[0]?.sequence ?? "0") + BigInt(1)).toString().padStart(4, "0")}`;
}
