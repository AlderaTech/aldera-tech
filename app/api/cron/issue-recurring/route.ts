/**
 * Recurring invoice issuance cron.
 *
 * Run daily:
 *   0 8 * * *  curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/issue-recurring
 */
import { NextResponse, type NextRequest } from "next/server";
import { issueDueRecurringInvoices } from "@/lib/actions/recurring-invoice";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await issueDueRecurringInvoices();
  return NextResponse.json({ ...result, timestamp: new Date().toISOString() });
}
