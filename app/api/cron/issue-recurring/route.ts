/**
 * Recurring invoice issuance cron.
 *
 * Run daily:
 *   0 8 * * *  curl -H "Authorization: Bearer $CRON_SECRET" https://yourdomain.com/api/cron/issue-recurring
 */
import { NextResponse, type NextRequest } from "next/server";
import { issueDueRecurringInvoices } from "@/lib/actions/recurring-invoice";
import { verifyCronSecret } from "@/lib/cron";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const authResult = verifyCronSecret(req);
  if (!authResult.authorized) {
    return NextResponse.json(
      { error: authResult.error ?? "Unauthorized" },
      { status: 401 }
    );
  }
  const result = await issueDueRecurringInvoices();
  return NextResponse.json({ ...result, timestamp: new Date().toISOString() });
}
