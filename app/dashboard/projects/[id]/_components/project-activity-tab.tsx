import { FadeUp } from "@/components/shared/motion";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export interface ProjectActivityItem {
  id: string;
  description: string;
  createdAt: Date;
  user: { name: string } | null;
}

interface ProjectActivityTabProps {
  activities: ProjectActivityItem[];
}

export function ProjectActivityTab({ activities }: ProjectActivityTabProps) {
  if (activities.length === 0) {
    return (
      <Card className="p-10 text-center text-muted-foreground">
        Belum ada aktivitas.
      </Card>
    );
  }

  return (
    <div className="relative ml-3 space-y-4 border-l-2 pl-6">
      {activities.map((a) => (
        <FadeUp key={a.id}>
          <div className="relative">
            <span className="absolute top-1 -left-[29px] size-3 rounded-full bg-primary ring-4 ring-background" />
            <Card className="p-4">
              <p className="text-sm">{a.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {a.user?.name} •{" "}
                {formatDate(a.createdAt, {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </Card>
          </div>
        </FadeUp>
      ))}
    </div>
  );
}
