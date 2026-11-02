import Link from "next/link";
import { ArrowUpRight, Users } from "lucide-react";

import { TopClientsBar } from "@/components/dashboard/analytics-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADMIN_ROUTES } from "@/lib/routes";
import { formatCurrency } from "@/lib/utils";
import type { AdminOverviewAnalytics } from "../../_data/overview";
import { AdminEmptyState } from "../admin-empty-state";

const MAX_TOP_CLIENT_SLOTS = 5;

export function TopClientsCard({
  clients,
}: {
  clients: AdminOverviewAnalytics["clientsData"];
}) {
  const totalRevenue = clients.reduce((sum, item) => sum + item.revenue, 0);
  const remainingSlots = Math.max(0, MAX_TOP_CLIENT_SLOTS - clients.length);

  return (
    <Card className="flex h-full flex-col overflow-hidden border-slate-200/90 bg-white shadow-2xs">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-900">
              <Users className="size-4 text-primary" />
              Top 5 Client by Revenue
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Peringkat klien berdasarkan invoice berstatus lunas.
            </p>
          </div>
          <div className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {clients.length} klien
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-4 p-4.5">
        {clients.length > 0 ? (
          <>
            <div className="space-y-3">
              <TopClientsBar data={clients} />
              {remainingSlots > 0 &&
                Array.from({ length: remainingSlots }, (_, idx) => {
                  const rank = clients.length + idx + 1;
                  return (
                    <div
                      key={`empty-slot-${rank}`}
                      data-client-slot-placeholder
                      className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="grid size-8 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-400">
                          {rank}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-xs font-semibold text-slate-500">
                            Slot peringkat tersedia
                          </div>
                          <div className="truncate text-[11px] text-slate-400">
                            Menunggu klien dengan invoice lunas berikutnya
                          </div>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-400">
                        Kosong
                      </span>
                    </div>
                  );
                })}
            </div>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                  Total Pendapatan Klien Teratas ({clients.length}/
                  {MAX_TOP_CLIENT_SLOTS} slot)
                </div>
                <div className="mt-0.5 text-sm font-bold text-slate-950 tabular-nums">
                  {formatCurrency(totalRevenue)}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                <Link
                  href={ADMIN_ROUTES.invoices}
                  className="inline-flex items-center gap-1 text-slate-600 transition-colors hover:text-primary"
                >
                  Daftar Invoice
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </Link>
                <Link
                  href={ADMIN_ROUTES.analytics}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Analitik Pendapatan
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </>
        ) : (
          <AdminEmptyState context="clients" />
        )}
      </CardContent>
    </Card>
  );
}
