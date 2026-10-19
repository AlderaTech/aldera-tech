"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUrlState } from "@/lib/hooks/use-url-state";

export interface DataPaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function DataPagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  className = "",
}: DataPaginationProps) {
  const { setParam, isPending } = useUrlState();
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems <= 0 && currentPage <= 1) {
    return null;
  }

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  function handlePage(page: number) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    if (onPageChange) {
      onPageChange(page);
    } else {
      setParam("page", page === 1 ? null : String(page));
    }
  }

  return (
    <nav
      aria-label="Paginasi navigasi data"
      className={`flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-4 py-3 text-sm sm:px-6 ${className}`}
    >
      <div className="text-xs text-muted-foreground">
        Menampilkan{" "}
        <span className="font-semibold text-foreground">
          {startItem}–{endItem}
        </span>{" "}
        dari <span className="font-semibold text-foreground">{totalItems}</span>{" "}
        data
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePage(currentPage - 1)}
          disabled={currentPage <= 1 || isPending}
          className="h-8 gap-1 px-2.5 text-xs"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="size-3.5" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </Button>

        <span className="px-2 text-xs font-medium text-muted-foreground tabular-nums">
          Hal. {currentPage} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePage(currentPage + 1)}
          disabled={currentPage >= totalPages || isPending}
          className="h-8 gap-1 px-2.5 text-xs"
          aria-label="Halaman berikutnya"
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </nav>
  );
}
