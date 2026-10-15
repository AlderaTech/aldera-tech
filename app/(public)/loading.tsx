import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function PublicLoading() {
  return (
    <div className="container mx-auto space-y-12 px-4 py-16">
      {/* Hero section skeleton */}
      <div className="flex flex-col items-center space-y-4 text-center">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-12 w-3/4 max-w-2xl" />
        <Skeleton className="h-5 w-1/2 max-w-xl" />
        <div className="flex gap-4 pt-4">
          <Skeleton className="h-11 w-36 rounded-md" />
          <Skeleton className="h-11 w-36 rounded-md" />
        </div>
      </div>

      {/* Grid section skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="space-y-4 p-6">
            <Skeleton className="size-12 rounded-lg" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-16 w-full" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-3.5 w-5/6" />
              <Skeleton className="h-3.5 w-4/6" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
