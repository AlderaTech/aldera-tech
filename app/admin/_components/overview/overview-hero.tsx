import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminMascot } from "../admin-mascot";
import { AdminPageHeader } from "../admin-page-header";
import type { getOverviewQuickActions } from "../../_utils/overview-config";
import styles from "./admin-overview.module.css";

type QuickAction = ReturnType<typeof getOverviewQuickActions>[number];
export function OverviewHero({ actions }: { actions: QuickAction[] }) {
  return (
    <section className={styles.hero}>
      <div>
        <AdminPageHeader
          eyebrow="Admin Console"
          title="Dashboard operasional Aldera Tech"
          description="Pantau proyek, invoice, konten, dan aktivitas tim dari satu area kerja yang ringkas."
        />
        {actions.length > 0 && (
          <div className={styles.heroActions}>
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
          </div>
        )}
      </div>
      <AdminMascot pose="guide" size="hero" className={styles.heroMascot} />
    </section>
  );
}
