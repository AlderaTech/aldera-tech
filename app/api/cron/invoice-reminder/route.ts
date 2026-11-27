/**
 * Invoice reminder cron endpoint.
 *
 * Setup on your VPS with crontab:
 *   0 9 * * *  curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/invoice-reminder
 *
 * Behavior:
 *   - Marks SENT invoices past their due date as OVERDUE.
 *   - Invoice reminders are disabled; this cron no longer sends messages.
 */
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
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

  const lockRes = await withCronLock("invoice-reminder", async () => {
    const now = new Date();

    // Mark overdue
    const overdueResult = await prisma.invoice.updateMany({
      where: {
        status: "SENT",
        dueDate: { lt: now },
      },
      data: { status: "OVERDUE" },
    });

    return {
      markedOverdue: overdueResult.count,
      reminders: [],
      totalReminders: 0,
      timestamp: now.toISOString(),
    };
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
    console.error("[Cron: invoice-reminder] Execution failed:", lockRes.error);
    return NextResponse.json(
      {
        success: false,
        error: lockRes.error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(lockRes.result);
}
