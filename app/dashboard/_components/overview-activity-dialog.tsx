"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Activity, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./overview.module.css";
import activityStyles from "./overview-activity.module.css";

export function OverviewActivityDialog({
  count,
  children,
}: {
  count: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <div className={activityStyles.footerAction}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={activityStyles.moreButton}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="activity-modal-dialog"
        >
          <span>Lihat lebih lanjut</span>
          <ArrowRight aria-hidden="true" />
        </button>
      </div>

      <div
        className={activityStyles.modalOverlay}
        data-state={open ? "open" : "closed"}
        aria-hidden={!open}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
      >
        <section
          id="activity-modal-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="activity-modal-heading"
          className={cn(styles.panel, activityStyles.modalCard)}
        >
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.eyebrow}>
                <Activity aria-hidden="true" /> Tetap terhubung
              </p>
              <h2 id="activity-modal-heading" className={styles.sectionTitle}>
                Detail Aktivitas Terbaru
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={activityStyles.closeButton}
              aria-label="Tutup detail aktivitas"
            >
              <X aria-hidden="true" />
            </button>
          </div>

          <div
            className={activityStyles.modalBody}
            onClick={(event) => {
              const target = event.target as HTMLElement | null;
              if (target?.closest("a")) setOpen(false);
            }}
          >
            <p className={activityStyles.modalSummary}>
              Menampilkan <strong>{count} aktivitas terbaru</strong> dari ruang
              kerja proyek Anda.
            </p>
            {children}
          </div>
        </section>
      </div>
    </>
  );
}
