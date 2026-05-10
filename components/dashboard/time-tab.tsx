"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Play, Square, Plus, Trash2, Timer, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import {
  startTimerAction,
  stopTimerAction,
  addManualEntryAction,
  deleteTimeEntryAction,
} from "@/lib/actions/time";

export type TimeEntryItem = {
  id: string;
  description: string;
  startedAt: Date;
  endedAt: Date | null;
  durationSec: number;
  billable: boolean;
  user: { id: string; name: string };
};

function fmtDuration(sec: number) {
  if (sec <= 0) return "0m";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function TimeTab({
  projectId,
  entries,
  currentUserId,
}: {
  projectId: string;
  entries: TimeEntryItem[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [description, setDescription] = React.useState("");
  const [isPending, startTransition] = React.useTransition();
  const [showManual, setShowManual] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<TimeEntryItem | null>(
    null
  );

  const running = entries.find(
    (e) => !e.endedAt && e.user.id === currentUserId
  );

  // Live tick counter for running timer
  const [nowMs, setNowMs] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [running]);

  const runningSeconds = running
    ? Math.floor((nowMs - new Date(running.startedAt).getTime()) / 1000)
    : 0;

  function start() {
    if (!description.trim()) {
      toast.error("Isi deskripsi dulu");
      return;
    }
    startTransition(async () => {
      await startTimerAction(projectId, description);
      setDescription("");
      router.refresh();
    });
  }

  function stop(id: string) {
    startTransition(async () => {
      await stopTimerAction(id);
      router.refresh();
    });
  }

  function addManual(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await addManualEntryAction(projectId, fd);
      if (r.ok) {
        toast.success("Entry ditambahkan");
        setShowManual(false);
        (e.target as HTMLFormElement).reset();
        router.refresh();
      } else {
        toast.error(r.error ?? "Gagal");
      }
    });
  }

  function del(id: string) {
    startTransition(async () => {
      await deleteTimeEntryAction(id);
      setDeleteTarget(null);
      router.refresh();
    });
  }

  // Aggregates
  const completed = entries.filter((e) => e.endedAt);
  const totalSec = completed.reduce((s, e) => s + e.durationSec, 0);
  const billableSec = completed
    .filter((e) => e.billable)
    .reduce((s, e) => s + e.durationSec, 0);

  return (
    <div className="max-w-5xl space-y-4">
      <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex-wrap">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-slate-950">
            <Timer className="size-5" />
            Time Tracking
          </h2>
          <p className="text-sm text-muted-foreground">
            Catat waktu kerja di proyek ini untuk billing dan produktivitas.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowManual((s) => !s)}
        >
          <Plus className="size-4" /> {showManual ? "Tutup" : "Tambah Manual"}
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <Card className="space-y-4 border-slate-200 bg-white p-4 shadow-sm">
          {running ? (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="text-xs text-muted-foreground mb-1">
                  Sedang berjalan
                </div>
                <div className="text-2xl xxxl:text-3xl font-mono font-bold tabular-nums">
                  {fmtDuration(runningSeconds)}
                </div>
                <div className="text-sm text-muted-foreground truncate mt-1">
                  {running.description}
                </div>
              </div>
              <Button
                size="lg"
                variant="destructive"
                onClick={() => stop(running.id)}
                disabled={isPending}
              >
                <Square className="size-4" /> Stop
              </Button>
            </div>
          ) : (
            <div className="flex items-end gap-2 flex-wrap">
              <div className="flex-1 min-w-56 space-y-1.5">
                <Label htmlFor="desc">Apa yang Anda kerjakan?</Label>
                <Input
                  id="desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Review design, debug API…"
                />
              </div>
              <Button onClick={start} disabled={isPending} size="lg">
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Play className="size-4" />
                )}
                Mulai Timer
              </Button>
            </div>
          )}
        </Card>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
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
            <div className="text-xl font-bold">{completed.length}</div>
          </Card>
        </div>
      </div>

      {showManual && (
        <Card className="border-slate-200 bg-white p-4 shadow-sm">
          <form onSubmit={addManual} className="grid gap-3 sm:grid-cols-[1fr_120px_120px_auto] items-end">
            <div className="space-y-1.5">
              <Label htmlFor="m-desc" className="text-xs">
                Deskripsi
              </Label>
              <Input
                id="m-desc"
                name="description"
                placeholder="Deskripsi pekerjaan"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="m-minutes" className="text-xs">
                Menit
              </Label>
              <Input
                id="m-minutes"
                name="minutes"
                type="number"
                min="1"
                placeholder="60"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Billable</Label>
              <select
                name="billable"
                defaultValue="true"
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="true">Ya</option>
                <option value="false">Tidak</option>
              </select>
            </div>
            <Button type="submit" disabled={isPending}>
              Simpan
            </Button>
          </form>
        </Card>
      )}

      {/* Entries table */}
      {entries.length === 0 ? (
        <Card className="border-dashed p-8 text-center text-sm text-muted-foreground">
          Belum ada time entry.
        </Card>
      ) : (
        <Card className="overflow-hidden border-slate-200 bg-white p-0 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="hidden md:table-cell">Anggota</TableHead>
                <TableHead className="hidden lg:table-cell">Waktu</TableHead>
                <TableHead className="text-right">Durasi</TableHead>
                <TableHead>Billable</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="max-w-xs truncate">
                    {e.description}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {e.user.name}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {formatDate(e.startedAt, {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {e.endedAt ? fmtDuration(e.durationSec) : "Tidak tersedia"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={e.billable ? "default" : "outline"}>
                      {e.billable ? "Billable" : "Non-bill"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Hapus"
                      onClick={() => setDeleteTarget(e)}
                      disabled={isPending || !!(e.endedAt === null)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Hapus time entry?"
        description={`Entry "${deleteTarget?.description ?? ""}" akan dihapus dari catatan waktu project.`}
        confirmLabel="Hapus entry"
        destructive
        pending={isPending}
        onConfirm={() => {
          if (deleteTarget) del(deleteTarget.id);
        }}
      />
    </div>
  );
}
