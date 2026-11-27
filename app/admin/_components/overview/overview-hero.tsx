import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "../admin-page-header";
import type { getOverviewQuickActions } from "../../_utils/overview-config";

type QuickAction = ReturnType<typeof getOverviewQuickActions>[number];
export function OverviewHero({ actions }: { actions: QuickAction[] }) {
  return (
    <AdminPageHeader
      category="overview"
      title="Dashboard operasional Aldera Tech"
      description="Pantau proyek, invoice, konten, dan aktivitas tim dari satu area kerja yang ringkas."
      mascot="guide"
      actions={
        actions.length > 0 ? (
          <>
            {actions.slice(0, 3).map((action, index) => (
              <Button
                key={action.href}
                asChild
                variant={index === 0 ? "default" : "outline"}
              >
                <Link href={action.href}>
                  <action.icon className="size-4" aria-hidden="true" />
                  {action.label}
                </Link>
              </Button>
            ))}
          </>
        ) : undefined
      }
    />
  );
}
