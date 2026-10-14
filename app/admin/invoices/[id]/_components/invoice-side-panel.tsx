import { Building2, CalendarClock, FileText, Mail } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { InvoiceDetail } from "../_data/invoice-detail";
import { InvoiceProofVerifier } from "./invoice-proof-verifier";

export function InvoiceSidePanel({ invoice }: { invoice: InvoiceDetail }) {
  const latestPayment = invoice.payments?.[0] ?? null;

  return (
    <div className="space-y-4">
      {(invoice.paymentProofUrl || latestPayment) && (
        <InvoiceProofVerifier
          invoiceId={invoice.id}
          invoiceNumber={invoice.number}
          status={invoice.status}
          paymentProofUrl={invoice.paymentProofUrl}
          paymentMethod={invoice.paymentMethod}
          payment={latestPayment}
        />
      )}
      <Card className="border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
          <Building2 className="size-4 text-primary" />
          Client
        </div>
        <div className="space-y-2 text-sm">
          <InfoRow label="Nama" value={invoice.client.name} strong />
          <InfoRow label="Email" value={invoice.client.email} />
          {invoice.client.phone && (
            <InfoRow label="Telepon" value={invoice.client.phone} />
          )}
        </div>
      </Card>

      <Card className="border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
          <FileText className="size-4 text-primary" />
          Catatan
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
          {invoice.notes || "Tidak ada catatan untuk invoice ini."}
        </p>
      </Card>

      <Card className="border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
          <CalendarClock className="size-4 text-primary" />
          Tracking
        </div>
        <div className="space-y-2 text-sm">
          <InfoRow label="Dibuat" value={formatDate(invoice.createdAt)} />
          <InfoRow
            label="Reminder terakhir"
            value={
              invoice.lastReminderSentAt
                ? formatDate(invoice.lastReminderSentAt)
                : "Belum pernah"
            }
          />
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">Email client</span>
            <span className="inline-flex items-center gap-1 text-right">
              <Mail className="size-3.5" />
              {invoice.client.email}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function InfoRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>
      <span className={strong ? "text-right font-medium" : "text-right"}>
        {value}
      </span>
    </div>
  );
}
