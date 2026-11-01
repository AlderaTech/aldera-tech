"use client";

import { useUrlState } from "@/lib/hooks/use-url-state";
import { cn } from "@/lib/utils";

interface StatusOption {
  value: string;
  label: string;
}

const ORDER_STATUS_OPTIONS: StatusOption[] = [
  { value: "ALL", label: "Semua" },
  { value: "PENDING", label: "Menunggu Review" },
  { value: "REVIEWED", label: "Sedang Diproses" },
  { value: "CONVERTED", label: "Dikonversi" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

export function OrderStatusFilter({ className = "" }: { className?: string }) {
  const { getParam, setParam } = useUrlState();
  const currentStatus = getParam("status", "ALL").toUpperCase();

  return (
    <div
      className={cn("mb-5 flex flex-wrap items-center gap-1.5", className)}
      role="group"
      aria-label="Filter status pengajuan estimasi"
    >
      {ORDER_STATUS_OPTIONS.map((opt) => {
        const isActive = currentStatus === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() =>
              setParam("status", opt.value === "ALL" ? null : opt.value, {
                resetPage: true,
              })
            }
            aria-pressed={isActive}
            data-status={opt.value}
            className={cn(
              "cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all select-none",
              isActive
                ? "border border-primary bg-primary text-white shadow-xs"
                : "border border-slate-300 bg-white text-slate-600 shadow-2xs hover:border-primary/40 hover:bg-slate-50 hover:text-slate-900 dark:border-border/80 dark:bg-background dark:text-muted-foreground"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
