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
      </SearchFilterBar>
    </div>
  );
}
