"use client";

import { CircleAlert, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardRefresh } from "@/components/dashboard/_hooks/use-dashboard-refresh";
import styles from "./project-list.module.css";

export function ProjectsLoadError() {
  const { refresh, isPending } = useDashboardRefresh();
  return (
    <section
      className={styles.statePanel}
      aria-labelledby="projects-error-heading"
      aria-busy={isPending}
    >
      <div className={styles.stateContent}>
        <span className={styles.errorIcon} aria-hidden="true">
          <CircleAlert />
        </span>
        <div role="alert">
          <h2 id="projects-error-heading">Proyek belum dapat dimuat</h2>
          <p>
            Terjadi kendala saat mengambil daftar proyek. Silakan coba lagi.
          </p>
        </div>
        <Button
          type="button"
          className={styles.primaryButton}
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
