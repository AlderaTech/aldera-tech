export type TimeEntryItem = {
  id: string;
  description: string;
  startedAt: Date;
  endedAt: Date | null;
  durationSec: number;
  billable: boolean;
  user: { id: string; name: string };
};

export function fmtDuration(sec: number) {
  if (sec <= 0) return "0m";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}
