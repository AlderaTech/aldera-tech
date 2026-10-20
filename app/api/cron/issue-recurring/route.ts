/**
 * Recurring invoice issuance cron.
 *
 * Run daily:
 *   0 8 * * *  curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/issue-recurring
 */
import { NextResponse, type NextRequest } from "next/server";
import { issueDueRecurringInvoices } from "@/lib/actions/recurring-invoice";
import { verifyCronSecret } from "@/lib/cron";
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

  const lockRes = await withCronLock("issue-recurring", async () => {
    return await issueDueRecurringInvoices();
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
    console.error("[Cron: issue-recurring] Execution failed:", lockRes.error);
    return NextResponse.json(
      {
        success: false,
        error: lockRes.error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ...lockRes.result, timestamp: new Date().toISOString() });
}
