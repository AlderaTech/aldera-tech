"use client";

import { useState, type ReactNode } from "react";
import { Activity, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className={activityStyles.footerAction}>
        <DialogTrigger asChild>
          <button
            type="button"
            className={activityStyles.moreButton}
            aria-controls="activity-modal-dialog"
          >
            <span>Lihat lebih lanjut</span>
            <ArrowRight aria-hidden="true" />
          </button>
        </DialogTrigger>
      </div>
      <DialogContent
        id="activity-modal-dialog"
        className={activityStyles.modalCard}
      >
        <div className={styles.panelHeader}>
          <div>
            <p className={styles.eyebrow}>
              <Activity aria-hidden="true" /> Tetap terhubung
            </p>
            <DialogTitle className={styles.sectionTitle}>
              Detail Aktivitas Terbaru
            </DialogTitle>
          </div>
        </div>

        <div
          className={activityStyles.modalBody}
          onClick={(event) => {
            const target = event.target as HTMLElement | null;
            if (target?.closest("a")) setOpen(false);
          }}
        >
          <DialogDescription className={activityStyles.modalSummary}>
            Menampilkan <strong>{count} aktivitas terbaru</strong> dari ruang
            kerja proyek Anda.
          </DialogDescription>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
