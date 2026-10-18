"use client";

import { CircleAlert, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardRefresh } from "@/components/dashboard/_hooks/use-dashboard-refresh";
import commonStyles from "../../projects/_components/project-list.module.css";

export function OrdersLoadError() {
  const { refresh, isPending } = useDashboardRefresh();
  return (
    <section
      className={commonStyles.statePanel}
      aria-labelledby="orders-error-heading"
      aria-busy={isPending}
    >
      <div className={commonStyles.stateContent}>
        <span className={commonStyles.errorIcon} aria-hidden="true">
          <CircleAlert />
        </span>
        <div role="alert">
          <h2 id="orders-error-heading">Estimasi belum dapat dimuat</h2>
          <p>
            Terjadi kendala saat mengambil riwayat estimasi. Silakan coba lagi.
          </p>
        </div>
        <Button
          className={commonStyles.primaryButton}
          type="button"
          onClick={refresh}
          disabled={isPending}
        >
          <RotateCw
            className={
              isPending ? "animate-spin motion-reduce:animate-none" : undefined
            }
            aria-hidden="true"
          />
          {isPending ? "Memuat ulang..." : "Coba Lagi"}
        </Button>
      </div>
    </section>
  );
}
