import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-60" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5 space-y-3">
            <Skeleton className="size-10 rounded-lg" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-24" />
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <Skeleton className="h-64 w-full" />
      </Card>
    </div>
  );
}
