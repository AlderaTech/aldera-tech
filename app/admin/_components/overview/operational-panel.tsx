import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  getOperationalCards,
  getOverviewQuickActions,
} from "../../_utils/overview-config";
import { AdminIconArt } from "../admin-icon-art";
import styles from "./admin-overview.module.css";

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
    <Card className="overflow-hidden border-slate-200/90 bg-white shadow-2xs">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-5 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-900">
              <CheckCircle2 className="size-4 text-primary" />
              Panel Operasional
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Ringkasan kerja rutin dan pintasan aksi admin.
            </p>
          </div>
          <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            Live
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4.5">
        <div className={styles.opsLinks}>
          {cards.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm shadow-2xs transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <AdminIconArt hint={item.label} size="sm" />
              <span className="min-w-0 space-y-0.5">
                <span className="block truncate text-xs font-semibold text-slate-900">
                  {item.label}
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  Buka halaman terkait
                </span>
              </span>
              <span className="inline-flex min-w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-900">
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
    <div className="space-y-3 rounded-lg border border-slate-200/80 bg-slate-50/60 p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold tracking-[0.1em] text-slate-500 uppercase">
            Aksi Cepat
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Buat data baru dari panel ini.
          </p>
        </div>
        <ArrowUpRight className="size-3.5 text-slate-400" />
      </div>
      <div className={styles.opsActions}>
        {actions.map((action) => (
          <Button
            key={action.href}
            asChild
            variant="outline"
            className="h-8.5 justify-start border-slate-200 bg-white px-3 text-xs text-slate-800 shadow-2xs hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          >
            <Link href={action.href}>
              <action.icon className="size-3.5" />
              {action.label}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
