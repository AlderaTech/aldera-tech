import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="space-y-3 p-5">
            <Skeleton className="size-10 rounded-lg" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-24" />
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="space-y-4 p-6">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </Card>
        <Card className="space-y-3 p-6">
          <Skeleton className="h-5 w-24" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </Card>
      </div>
    </div>
  );
}
