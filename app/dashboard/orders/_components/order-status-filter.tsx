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
              "cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition-all select-none",
              isActive
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border border-border/80 bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
