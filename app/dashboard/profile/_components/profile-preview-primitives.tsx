"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "./profile-preview.module.css";

export function DemoBadge() {
  return <span className={styles.demoBadge}>Demo</span>;
}

export function PreviewPanelHeader({
  id,
  title,
  icon: Icon,
  visual,
}: {
  id: string;
  title: string;
  icon: LucideIcon;
  visual?: ReactNode;
}) {
  return (
    <header className={styles.panelHeader}>
      {visual ?? (
        <span className={styles.panelIcon} aria-hidden="true">
          <Icon size={19} />
        </span>
      )}
      <h2 id={id}>{title}</h2>
      <DemoBadge />
    </header>
  );
}

export function PreviewFeedback({
  status,
  label,
  message,
  onRetry,
  action,
}: {
  status: "loading" | "empty" | "error";
  label: string;
  message?: string;
  onRetry?: () => void;
  action?: ReactNode;
}) {
  if (status === "loading")
    return (
      <div
        className={styles.loading}
        role="status"
        aria-label={label}
        data-preview-state="loading"
      >
        {[0, 1, 2].map((index) => (
          <div className={styles.loadingRow} key={index} aria-hidden="true">
            <Skeleton className="size-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  const Icon = status === "error" ? AlertCircle : FolderOpen;
  return (
    <div
      className={styles.feedback}
      role={status === "error" ? "alert" : undefined}
      data-preview-state={status}
    >
      <Icon size={26} aria-hidden="true" />
      <h3>{label}</h3>
      <p>{message ?? "Belum ada data contoh untuk ditampilkan."}</p>
      {status === "error" && onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Coba lagi
        </Button>
      )}
      {action}
    </div>
  );
}
