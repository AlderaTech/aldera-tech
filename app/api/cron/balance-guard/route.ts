/**
 * Low Balance Multi-channel Alert Guard Cron Endpoint (F13).
 *
 * Setup on VPS with crontab or automated scheduler:
 *   (every 30m): 30 * * * *  curl -H "Authorization: Bearer $CRON_SECRET" https://aldera.tech/api/cron/balance-guard
 *
 * Behavior:
 *   - Evaluates active users with balance < Rp 10.000.
 *   - Enforces a 12-hour cooldown window between alerts for the same user.
 *   - Automatically resets cooldown when user tops up balance.
 *   - Dispatches formatted alert with top-up action to Telegram Bot and WhatsApp Fonnte.
 */

import { NextResponse, type NextRequest } from "next/server";
import { verifyCronSecret } from "@/lib/cron";
import { runBalanceGuard } from "@/lib/balance-guard";
import { withCronLock } from "@/lib/cron-lock";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const authResult = verifyCronSecret(req);
  if (!authResult.authorized) {
    return NextResponse.json(
      { error: authResult.error ?? "Unauthorized" },
      { status: 401 }
    );
  }

  const lockRes = await withCronLock("balance-guard", async () => {
    return await runBalanceGuard();
  });

  if (!lockRes.executed) {
    return NextResponse.json(
      {
        skipped: true,
        reason: lockRes.reason ?? "Job already running",
      },
      { status: 200 }
    );
  }

  if (lockRes.error) {
    console.error("[Cron: balance-guard] Execution failed:", lockRes.error);
    return NextResponse.json(
      {
        success: false,
        error: lockRes.error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    ...lockRes.result,
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
