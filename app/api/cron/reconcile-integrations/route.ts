import { NextResponse, type NextRequest } from "next/server";
import { verifyCronSecret } from "@/lib/cron";
import { withCronLock } from "@/lib/cron-lock";
import { processInvoiceBalanceEffects } from "@/lib/invoice-balance-effects";
import { retryIntegrationSettings } from "@/lib/integration-sync";
import { cleanupLoginAttempts } from "@/lib/login-rate-limit";
export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request).authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await withCronLock("reconcile-integrations", async () => {
    await processInvoiceBalanceEffects();
    await retryIntegrationSettings();
    await cleanupLoginAttempts();
    return { ok: true };
  });
  if (result.error)
    return NextResponse.json(
      { error: "Rekonsiliasi tertunda; periksa panel admin." },
      { status: 503 }
    );
  return NextResponse.json({ ok: true, executed: result.executed });
}
