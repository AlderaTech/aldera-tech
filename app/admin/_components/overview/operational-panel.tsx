import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  getOperationalCards,
  getOverviewQuickActions,
} from "../../_utils/overview-config";

type OperationalCard = ReturnType<typeof getOperationalCards>[number];
type QuickAction = ReturnType<typeof getOverviewQuickActions>[number];

export function OperationalPanel({
  cards,
  actions,
}: {
  cards: OperationalCard[];
  actions: QuickAction[];
}) {
  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-200 bg-slate-50/80 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="size-4 text-primary" />
              Panel Operasional
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Ringkasan kerja rutin dan pintasan aksi admin.
            </p>
          </div>
          <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
            Live
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <div className="grid gap-2">
          {cards.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-xs transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <item.icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-slate-900">
                  {item.label}
                </span>
                <span className="text-xs text-slate-500">
                  Buka halaman terkait
                </span>
              </span>
              <span className="inline-flex min-w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-900">
                {item.value}
              </span>
            </Link>
          ))}
        </div>

        {actions.length > 0 && <QuickActions actions={actions} />}
      </CardContent>
    </Card>
  );
}

function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Aksi Cepat
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Buat data baru dari panel ini.
          </p>
        </div>
        <ArrowUpRight className="size-4 text-slate-400" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {actions.map((action) => (
          <Button
            key={action.href}
            asChild
            variant="outline"
            className="h-10 justify-start border-slate-200 bg-white text-slate-800 shadow-xs hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          >
            <Link href={action.href}>
              <action.icon className="size-4" />
              {action.label}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
