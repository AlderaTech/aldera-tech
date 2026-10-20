/**
 * Invoice reminder cron endpoint.
 *
 * Setup on your VPS with crontab:
 *   0 9 * * *  curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/invoice-reminder
 *
 * Behavior:
 *   - Marks SENT invoices past their due date as OVERDUE.
 *   - Sends reminder emails for invoices that are OVERDUE or will be due within 3 days,
 *     skipping those that received a reminder in the last 72 hours.
 */
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsApp } from "@/lib/whatsapp";
import { waTemplates } from "@/lib/whatsapp-templates";
import { formatCurrency, formatDate } from "@/lib/utils";
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
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    // Mark overdue
    const overdueResult = await prisma.invoice.updateMany({
      where: {
        status: "SENT",
        dueDate: { lt: now },
      },
      data: { status: "OVERDUE" },
    });

    // Fetch targets
    const targets = await prisma.invoice.findMany({
      where: {
        status: { in: ["SENT", "OVERDUE"] },
        dueDate: { lte: in3Days },
        OR: [
          { lastReminderSentAt: null },
          { lastReminderSentAt: { lt: threeDaysAgo } },
        ],
      },
      include: { client: true },
    });

    const results: Array<{
      id: string;
      status: "sent" | "failed";
      error?: string;
    }> = [];

    for (const invoice of targets) {
      if (!invoice.client.phone) {
        results.push({
          id: invoice.id,
          status: "failed",
          error: "Nomor WhatsApp klien tidak tersedia",
        });
        continue;
      }

      try {
        const tpl = waTemplates.invoiceReminder(
          invoice.number,
          formatCurrency(Number(invoice.total)),
          formatDate(invoice.dueDate)
        );

        const res = await sendWhatsApp({
          to: invoice.client.phone,
          message: `*${tpl.title}*\n\n${tpl.message}`,
        });

        if (!res.success) {
          throw new Error(res.error ?? "Gagal mengirim WhatsApp");
        }

        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { lastReminderSentAt: new Date() },
        });
        results.push({ id: invoice.id, status: "sent" });
      } catch (err) {
        results.push({
          id: invoice.id,
          status: "failed",
          error: (err as Error).message,
        });
      }
    }

    return {
      markedOverdue: overdueResult.count,
      reminders: results,
      totalReminders: results.length,
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
