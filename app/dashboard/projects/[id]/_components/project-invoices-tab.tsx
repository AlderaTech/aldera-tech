import type { InvoiceStatus } from "@prisma/client";
import { Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { invoiceStatusMeta } from "@/lib/status-meta";
import { formatCurrency, formatDate } from "@/lib/utils";
import { API_ROUTES } from "@/lib/routes";

export interface ProjectInvoiceItem {
  id: string;
  number: string;
  status: InvoiceStatus;
  dueDate: Date;
  total: unknown;
}

interface ProjectInvoicesTabProps {
  invoices: ProjectInvoiceItem[];
}

export function ProjectInvoicesTab({ invoices }: ProjectInvoicesTabProps) {
  if (invoices.length === 0) {
    return (
      <Card className="p-10 text-center text-muted-foreground">
        Belum ada invoice untuk proyek ini.
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {invoices.map((inv) => {
        const m = invoiceStatusMeta[inv.status];
        return (
          <Card
            key={inv.id}
            className="flex flex-wrap items-center justify-between gap-3 p-4"
          >
            <div>
              <div className="font-medium">{inv.number}</div>
              <div className="text-xs text-muted-foreground">
                Due: {formatDate(inv.dueDate)}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={m.variant}>{m.label}</Badge>
              <span className="font-semibold">
                {formatCurrency(Number(inv.total))}
              </span>
              <Button size="sm" variant="outline" asChild>
                <a href={API_ROUTES.invoicePdf(inv.id)} download>
                  <Download className="size-3.5" /> PDF
                </a>
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
