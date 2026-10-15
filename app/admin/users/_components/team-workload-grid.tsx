import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ROLE_LABELS } from "@/lib/permissions";
import { getInitials } from "@/lib/utils";
import {
  WEEKLY_CAPACITY_HOURS,
  type StaffWorkloadItem,
} from "../_data/get-users-and-workload";

export function TeamWorkloadGrid({ staff }: { staff: StaffWorkloadItem[] }) {
  if (staff.length === 0) {
    return (
      <Card className="p-10 text-center text-muted-foreground">
        Belum ada anggota tim staf aktif.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Pemantauan kapasitas mingguan staf (target {WEEKLY_CAPACITY_HOURS} jam/minggu)
        </span>
        <span>{staff.length} Staf Terdata</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {staff.map((member) => (
          <Card key={member.id} className="transition-all hover:shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar className="size-8">
                    {member.avatar ? (
                      <AvatarImage src={member.avatar} alt={member.name} />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="truncate text-base">
                    {member.name}
                  </CardTitle>
                </div>
                <div className="flex flex-wrap gap-1">
                  {member.roles.map((r) => (
                    <Badge key={r} variant="secondary" className="text-xs">
                      {ROLE_LABELS[r] ?? r}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted-foreground">Kapasitas</span>
                  <span className="font-medium tabular-nums">
                    {member.hoursThisWeek} jam / {WEEKLY_CAPACITY_HOURS} jam
                  </span>
                </div>
                <Progress
                  value={member.capacityPct}
                  className={`h-2 ${
                    member.capacityPct > 90
                      ? "[&>div]:bg-destructive"
                      : member.capacityPct > 70
                        ? "[&>div]:bg-amber-500"
                        : ""
                  }`}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/40 p-2 text-center">
                <div>
                  <p className="text-lg font-bold">{member.activeTasks}</p>
                  <p className="text-xs text-muted-foreground">Tasks</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{member.activeProjects}</p>
                  <p className="text-xs text-muted-foreground">Proyek</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-destructive">
                    {member.urgentTasks}
                  </p>
                  <p className="text-xs text-muted-foreground">Urgent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
