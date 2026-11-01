"use client";

import { useUrlState } from "@/lib/hooks/use-url-state";
import { SearchFilterBar } from "@/components/shared/search-filter-bar";
import { cn } from "@/lib/utils";

interface StatusOption {
  value: string;
  label: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: "ALL", label: "Semua" },
  { value: "IN_PROGRESS", label: "Berjalan" },
  { value: "REVIEW", label: "Review" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "PENDING", label: "Pending" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

export function ProjectFilters() {
  const { getParam, setParam } = useUrlState();
  const currentStatus = getParam("status", "ALL").toUpperCase();

  return (
    <div className="mb-6 flex flex-col gap-3">
      <SearchFilterBar placeholder="Cari nama proyek..." searchParamKey="q">
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Filter status proyek"
        >
          {STATUS_OPTIONS.map((opt) => {
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
      </SearchFilterBar>
    </div>
  );
}
