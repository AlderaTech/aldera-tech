import { Card } from "@/components/ui/card";
import { fmtDuration } from "./types";

export function TimeSummaryCards({
  totalSec,
  billableSec,
  completedCount,
}: {
  totalSec: number;
  billableSec: number;
  completedCount: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Card className="border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs text-muted-foreground">Total Waktu</div>
        <div className="text-xl font-bold tabular-nums">
          {fmtDuration(totalSec)}
        </div>
      </Card>
      <Card className="border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs text-muted-foreground">Billable</div>
        <div className="text-xl font-bold tabular-nums">
          {fmtDuration(billableSec)}
        </div>
      </Card>
      <Card className="border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs text-muted-foreground">Entries</div>
        <div className="text-xl font-bold">{completedCount}</div>
      </Card>
    </div>
  );
}
