import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "../admin-page-header";
import type { getOverviewQuickActions } from "../../_utils/overview-config";

type QuickAction = ReturnType<typeof getOverviewQuickActions>[number];

export function OverviewHero({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <AdminPageHeader
          eyebrow="Admin Console"
          title="Dashboard operasional Aldera Tech"
          description="Pantau proyek, invoice, konten, dan aktivitas tim dari satu area kerja yang ringkas."
          actions={
            actions.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                {actions.slice(0, 3).map((action, index) => (
                  <Button
                    key={action.href}
                    asChild
                    variant={index === 0 ? "default" : "outline"}
                    size="sm"
                    className="h-9"
                  >
                    <Link href={action.href}>
                      <action.icon className="size-4" />
                      {action.label}
                    </Link>
                  </Button>
                ))}
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
}
