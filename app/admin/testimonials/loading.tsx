import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function AdminTestimonialsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-9 w-44 rounded-md" />
      </div>

      {/* Stat Grid Skeleton (4 cards) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="flex items-center justify-between border border-slate-200 bg-white p-4 shadow-xs"
          >
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
            <Skeleton className="size-10 rounded-lg" />
          </Card>
        ))}
      </div>

      {/* Testimonials Table Card Skeleton */}
      <Card className="overflow-hidden border border-slate-200 bg-white shadow-xs">
        {/* Search and filters bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <Skeleton className="h-9 w-72 max-w-full" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-32 rounded-md" />
          </div>
        </div>

        {/* Table rows skeleton */}
        <div className="divide-y border-t border-slate-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 px-4 py-3.5"
            >
              {/* Client info with avatar */}
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>

              {/* Star rating */}
              <div className="hidden items-center gap-1 sm:flex">
                {Array.from({ length: 5 }).map((_, starIdx) => (
                  <Skeleton key={starIdx} className="size-3.5 rounded-full" />
                ))}
              </div>

              {/* Content snippet */}
              <Skeleton className="hidden h-4 w-60 max-w-xs md:block" />

              {/* Project badge */}
              <Skeleton className="hidden h-5 w-24 rounded-md lg:block" />

              {/* Published status badge */}
              <Skeleton className="h-5 w-20 rounded-full" />

              {/* Action buttons (toggle, edit, delete) */}
              <div className="flex items-center gap-1">
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
                <Skeleton className="size-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
